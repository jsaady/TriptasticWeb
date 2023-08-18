import React, { FormEvent, useCallback, useState } from 'react';
import { styled } from 'styled-components';
import { useHttp } from './utils/http.js';
import { useForm } from './utils/forms.js';
import { useAsyncHttp } from './utils/useAsync.js';
import { useAuthorization } from './utils/useAuth.js';



const LoginForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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
  email: string;
  password: string;
}

export const Login = () => {
  const { register, registerForm } = useForm<LoginForm>();
  const { setLoggedIn, loggedIn } = useAuthorization();

  const [handleSubmit, { loading }] = useAsyncHttp(async ({ post }, state: LoginForm) => {    
    await post('/api/auth/login', {
      ...state
    });

    setLoggedIn(true);
  }, [setLoggedIn]);

  return <LoginForm {...registerForm(handleSubmit)}>
    <LoginHeading>You must log in to continue</LoginHeading>
    {loggedIn && <p data-testid="login-success">Log in succeeded</p>}
    <LoginInput disabled={loggedIn}  {...register('email')} placeholder='Email' type="email"></LoginInput>
    <LoginInput disabled={loggedIn} {...register('password')} placeholder='Password' type="password"></LoginInput>

    <LoginButton type="submit">LOGIN</LoginButton>
    <LoginButton type="button">REGISTER</LoginButton>
  </LoginForm>
};
