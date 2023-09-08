import { Outlet } from 'react-router';
import { Wrapper } from './Wrapper.js';
import { useAuthorization, withAuthorization } from './utils/useAuth.js';

export interface RootContext {
  authz: ReturnType<typeof useAuthorization>;
}

export const Root = withAuthorization(() => {
  const { loggedIn } = useAuthorization();
  return <Wrapper $showGradient={!loggedIn}>
    <Outlet />
  </Wrapper>
});
