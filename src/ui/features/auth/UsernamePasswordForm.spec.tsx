import '@testing-library/jest-dom';
import { act, fireEvent, render, cleanup } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';
import { withAuthorization } from '../../utils/useAuth.js';
import { UsernamePasswordForm } from './UsernamePasswordForm.js';
import { withGlobalSocketProvider } from '../../utils/useSocket.js';
jest.mock('@simplewebauthn/browser', () => ({
  startAuthentication() {
    return {};
  }
}));

let requestBody: any;

const server = setupServer(
  rest.get('/api/auth/check', (req, res, ctx) => {
    return res(ctx.json({}))
  })
);
  
beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

test('login screen should render', async () => {
  server.use(
    rest.post('/api/auth/login', async (req, res, ctx) => {
      requestBody = await req.json();
  
      return res(ctx.json({ success: true }));
    })
  );
  const Wrapped = withAuthorization(UsernamePasswordForm);

  const { findByTestId } = render(<Wrapped />, { wrapper: BrowserRouter as React.FC });

  const emailEl = document.getElementsByName('email')[0] as HTMLInputElement;
  const passwordEl = document.getElementsByName('password')[0] as HTMLInputElement;
  const submitEl = [...document.getElementsByTagName('button')].find(button => button.type === 'submit');

  expect(submitEl).toBeDefined();

  await act(() => {
    fireEvent.change(emailEl, { target: { value: 'test@test.com' }});
    fireEvent.change(passwordEl, { target: { value: 'password' }});
    fireEvent.click(submitEl!);
    // console.log(emailEl, passwordEl, submitEl);
  });
  await new Promise(process.nextTick);
  await findByTestId('login-success');

  expect(requestBody).toEqual({
    email: 'test@test.com',
    password: 'password',
    clientIdentifier: localStorage.getItem('clientIdentifier')
  });

});


test('login screen should show an error', async () => {
  server.use(
    rest.post('/api/auth/login', async (req, res, ctx) => {
      requestBody = await req.json();

      return res(ctx.status(400), ctx.json({ success: false, message: 'Invalid email or password' }));
    })
  );
  const Wrapped = withAuthorization(UsernamePasswordForm);

  const { findByTestId } = render(<Wrapped />, { wrapper: BrowserRouter as React.FC });

  const emailEl = document.getElementsByName('email')[0] as HTMLInputElement;
  const passwordEl = document.getElementsByName('password')[0] as HTMLInputElement;
  const submitEl = [...document.getElementsByTagName('button')].find(button => button.type === 'submit');

  expect(submitEl).toBeDefined();

  await act(() => {
    fireEvent.change(emailEl, { target: { value: 'test@test.com' }});
    fireEvent.change(passwordEl, { target: { value: 'passwosrd' }});
    fireEvent.click(submitEl!);
  });
  
  await new Promise(process.nextTick);

  const el = await findByTestId('login-error');

  expect(el).toHaveTextContent('Invalid email or password');
});
