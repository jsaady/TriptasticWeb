import { Outlet } from 'react-router';
import { Wrapper } from './Wrapper.js';
import { useAuthorization, withAuthorization } from './utils/useAuth.js';
import { GlobalSocketProvider } from './utils/useSocket.js';

export interface RootContext {
  authz: ReturnType<typeof useAuthorization>;
}

export const AppShell = withAuthorization(() => {
  const { loggedIn } = useAuthorization();
  return <Wrapper showGradient={!loggedIn}>
    <Outlet />
  </Wrapper>
});

export const Root = () => (
  <AppShell />
)
