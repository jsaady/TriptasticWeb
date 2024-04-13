import { Outlet } from 'react-router';
import { Wrapper } from './Wrapper.js';
import { useAuthorization, withAuthorization } from './utils/useAuth.js';
import { GlobalSocketProvider } from './utils/useSocket.js';
import { ModalOutlet } from './utils/modals.js';

export interface RootContext {
  authz: ReturnType<typeof useAuthorization>;
}

export const AppShell = withAuthorization(() => {
  const { loggedIn } = useAuthorization();
  return <Wrapper showGradient={!loggedIn}>
    <Outlet />
    <ModalOutlet />
  </Wrapper>
});

export const Root = () => (
  <AppShell />
)
