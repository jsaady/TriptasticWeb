import { ChangeEvent, FormEvent, MutableRefObject, createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface FormItemProps {
  ref: MutableRefObject<any | null>;
  onChange: (value: ChangeEvent<any>) => void;
  name: string;
  required?: boolean;
}

type FormItemPropsState<T> = Partial<Record<string&keyof T, FormItemProps>>;
type Constraints<T, K extends string & keyof T> = {
  required?: boolean;
  pattern?: RegExp;
} | ((value: T[K], state: T) => null|undefined|false|string);

export type RegistrationFn<T, K extends string&keyof T> = (name: K, constraints?: Constraints<T, K>) => FormItemProps;

const getExistingFormItemProps = (fip: FormItemPropsState<any>, name: string) => {
  const foundFip = fip[name];

  if (!foundFip) throw new ReferenceError(`Unknown form control ${name}. Was register called?`)

  return foundFip;
}

const applyConstraints = (props: FormItemProps, constraints: Constraints<any, any>) => {
  if (typeof constraints === 'function') return;

  if ('required' in constraints && constraints.required) {
    props.required = true;
  }

  if ('pattern' in constraints) {
    (props.ref.current as any)!.pattern = constraints.pattern!.source;
  }
};

export const useForm = <T>(initialState?: T, { validateOnSubmit = true }: { validateOnSubmit?: boolean } = {}) => {
  const [state, setState] = useState<T>(initialState as unknown as T);
  const [formItemProps, setFormItemProps] = useState<FormItemPropsState<T>>({});
  const stateRef = useRef(state);
  const setStateRef = useRef(setState);

  useEffect(() => {
    stateRef.current = state;
    setStateRef.current = setState;
  }, [state, setState]);

  const register = <K extends keyof T&string>(name: K, constraints?: Constraints<T, K>) => {
    let props = formItemProps[name];
    if (!props) {
      const ref = createRef<HTMLInputElement>();
      props = {
        onChange: (value: ChangeEvent<HTMLElement>) => {
          if (constraints && typeof constraints === 'function') {
            const error = constraints((value.target as any).value as any, stateRef.current);

            if (error) {
              ref.current!.setCustomValidity(error);

              if (validateOnSubmit) return;

              ref.current!.reportValidity();
              // return;
            } else {
              ref.current!.setCustomValidity('');
            }
          }

          setState((s) => ({
            ...s,
            [name]: (value.target as any).value
          }))
        },
        ref,
        name,
      };

      if (constraints) applyConstraints(props, constraints);

      setFormItemProps(fip => ({
        ...fip,
        [name]: props
      }));
    }

    return props;
  };

  const setValue = <K extends string&keyof T>(controlName: K, value: T[K]) => {
    setState(v => ({
      ...v,
      [controlName]: value
    }));

    const { ref } = getExistingFormItemProps(formItemProps, controlName);

    // todo: actual target the control and update
    (ref.current! as any).value = value as any;
  };

  const submitRef = useRef((_state: T) => {});

  const registerForm = useCallback((handleSubmit: (state: T) => any) => {
    submitRef.current = handleSubmit;

    return {
      onSubmit: (e: FormEvent) => {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        submitRef.current(stateRef.current);
      }
    }
  }, [validateOnSubmit]);

  return {
    register,
    setValue,
    registerForm,
    state
  };
}