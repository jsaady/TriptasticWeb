import React, { FormEvent, useCallback } from 'react';
import { styled } from 'styled-components';
import { useHttp } from './utils/http.js';
import { useForm } from './utils/forms.js';
import { useAsyncHttp } from './utils/useAsync.js';
import { useAuthorization } from './utils/useAuth.js';



const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 640px;
  margin: auto;
  padding: 1rem;
  align-items: center;
  background-color: white;
  margin-top: 10rem;
`;
  
const LoginInput = styled.input`
  background-color: #EEEEEE;
  border: none;
  height: 3rem;
  width: 90%;
  margin-top: 1rem;
  font-size: 16px;
  padding-right: 1rem;
  padding-left: 1rem;
  margin-left: 10%;
  margin-right: 10%;
`;

const LoginButton = styled.button`
  height: 2rem;
  width: 10rem;
  margin: 1rem;
  background-color: darkgrey;
  border: none;
  font-size: 16px;
`;

const LoginHeading = styled.h3``;

interface LoginForm {
  username: string;
  password: string;
}

export const Login = () => {
  const { register, registerForm } = useForm<LoginForm>();
  const { setLoggedIn } = useAuthorization();

  const [handleSubmit] = useAsyncHttp(async ({ post }, state: LoginForm) => {
    console.log('here3');
    
    await post('/api/auth/', {
      ...state
    });
    
    console.log('here4');
    setLoggedIn(true);
  }, [setLoggedIn]);

  return <LoginForm {...registerForm(handleSubmit)}>
    <LoginHeading>You must log in to continue</LoginHeading>
    <LoginInput {...register('username')} placeholder='Username'></LoginInput>
    <LoginInput {...register('password')} placeholder='Password' type="password"></LoginInput>
    <LoginButton type="submit">LOGIN</LoginButton>
  </LoginForm>
};
