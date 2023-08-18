import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, fireEvent, act, getByTestId } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Login } from './Login.js';
import { withAuthorization } from './utils/useAuth.js';
import { styled } from 'styled-components';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
test('login screen should render', async () => {
  let handled = false;
  let requestBody: any;
  server.use(
    rest.post('/api/auth/login', async (req, res, ctx) => {
      requestBody = await req.json();

      return res(ctx.status(200));
    })
  );

  const { findByTestId } = render(<Login />, { wrapper: withAuthorization(styled.div``) });

  const emailEl = document.getElementsByName('email')[0] as HTMLInputElement;
  const passwordEl = document.getElementsByName('password')[0] as HTMLInputElement;
  const submitEl = [...document.getElementsByTagName('button')].find(button => button.type === 'submit');

  expect(submitEl).toBeDefined();

  
  await act(() => {
    fireEvent.change(emailEl, { target: { value: 'test@test.com' }});
    fireEvent.change(passwordEl, { target: { value: 'password' }});
    fireEvent.click(submitEl!);
  });

  await new Promise(process.nextTick);

  await findByTestId('login-success');

  expect(requestBody).toEqual({
    email: 'test@test.com',
    password: 'password'
  });
});