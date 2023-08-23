import { ChangeEvent, FormEvent, MutableRefObject, createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface FormItemProps {
  ref: MutableRefObject<HTMLInputElement | null>;
  onChange: (value: ChangeEvent<HTMLInputElement>) => void;
  name: string;
}

type FormItemPropsState<T> = Partial<Record<string&keyof T, FormItemProps>>;
export type RegistrationFn<T> = (name: string&keyof T) => FormItemProps;

const getExistingFormItemProps = (fip: FormItemPropsState<any>, name: string) => {
  const foundFip = fip[name];

  if (!foundFip) throw new ReferenceError(`Unknown form control ${name}. Was register called?`)

  return foundFip;
}

export const useForm = <T>(initialState?: T) => {
  const [state, setState] = useState<T>(initialState as unknown as T);
  const [formItemProps, setFormItemProps] = useState<FormItemPropsState<T>>({});
  const stateRef = useRef(state);
  const setStateRef = useRef(setState);

  useEffect(() => {
    stateRef.current = state;
    setStateRef.current = setState;
  }, [state, setState]);

  const register: RegistrationFn<T> = (name: string&keyof T) => {
    let props = formItemProps[name];
    if (!props) {
      const ref = createRef<HTMLInputElement>();
      props = {
        onChange: (value: ChangeEvent<HTMLInputElement>) => {
          setState((s) => ({
            ...s,
            [name]: value.target.value
          }))
        },
        ref,
        name,
      };
      setFormItemProps(fip => ({
        ...fip,
        [name]: props
      }));
    }
    // useEffect(() => {
    // }, [name, props]);

    return props;
  };

  const setValue = <K extends string&keyof T>(controlName: K, value: T[K]) => {
    setState(v => ({
      ...v,
      [controlName]: value
    }));

    const { ref } = getExistingFormItemProps(formItemProps, controlName);

    // todo: actual target the control and update
    ref.current!.value = value as any;
  };

  const registerForm = useCallback((handleSubmit: (state: T) => any) => {
    return {
      onSubmit: (e: FormEvent) => {
        e.preventDefault();
        handleSubmit(stateRef.current);
      }
    }
  }, []);

  return {
    register,
    setValue,
    registerForm,
    state
  };
}