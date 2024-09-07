import { Outlet } from 'react-router';
import { Wrapper } from './Wrapper.js';
import { useAuthorization, withAuthorization } from './utils/useAuth.js';
import { ModalOutlet } from './utils/modals.js';
import { AlertOutlet } from './utils/alerts.js';
import { withSpinner } from './utils/useSpinner.js';

export interface RootContext {
  authz: ReturnType<typeof useAuthorization>;
}

export const AppShell = withSpinner(withAuthorization(() => {
  const { loggedIn } = useAuthorization();
  return <Wrapper showGradient={loggedIn === false}>
    <AlertOutlet />
    <Outlet />
    <ModalOutlet />
  </Wrapper>
}));

export const Root = () => (
  <AppShell />
)
