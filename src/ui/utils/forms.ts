import { ChangeEvent, FormEvent, MutableRefObject, createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';


interface FormChangeEvent {
  target: any;
}
export interface FormItemProps {
  ref: MutableRefObject<any | null>;
  onChange: (value: FormChangeEvent) => void;
  name: string;
  required?: boolean;
  value: any;
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

  const patchValue = useCallback((name: keyof T&string, value: any) => {
    setState((s) => ({
      ...s,
      [name]: value
    }));

    setFormItemProps(fip => ({
      ...fip,
      [name]: {
        ...getExistingFormItemProps(fip, name),
        value
      }
    }));

    console.log('patched', name, value);
  }, [setState, setFormItemProps]);

  const register = <K extends keyof T&string>(name: K, constraints?: Constraints<T, K>) => {
    let props = formItemProps[name];
    if (!props) {
      const ref = createRef<HTMLInputElement>();
      props = {
        onChange: (event: FormChangeEvent) => {
          console.log('uh oh');
          if (constraints && typeof constraints === 'function') {
            const error = constraints((event.target as any).value as any, stateRef.current);

            if (error) {
              ref.current!.setCustomValidity(error);

              if (validateOnSubmit) return;

              ref.current!.reportValidity();
              // return;
            } else {
              ref.current!.setCustomValidity('');
            }
          }

          const target = event.target as HTMLInputElement;
          let value: any = target.value;

          if (target.type === 'file') {
            value = target.multiple ? target.files! : target.files![0];
          }

          patchValue(name, value);
        },
        ref,
        name,
        value: stateRef.current?.[name] as any,
      };

      console.log('registering', name, props, stateRef.current?.[name]);

      if (constraints) applyConstraints(props, constraints);

      setFormItemProps(fip => ({
        ...fip,
        [name]: props
      }));
    }

    return props as FormItemProps;
  };

  const setValue = useCallback(<K extends string&keyof T>(controlName: K, value: T[K]) => {
    patchValue(controlName, value);
  }, [patchValue, formItemProps]);

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