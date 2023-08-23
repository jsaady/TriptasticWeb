import { useEffect } from 'react';
import { Authenticated } from './Authenticated.js';
import { Wrapper } from './Wrapper.js';
import { Login } from './features/auth/Login.js';
import { useAsyncHttp } from './utils/useAsync.js';
import { useAuthorization, withAuthorization } from './utils/useAuth.js';

const App = () => {
  const { loggedIn, loading, setLoggedIn } = useAuthorization();

  if (loading) return 'Loading...';

  return <Wrapper $showGradient={!loggedIn}>
    {
      loggedIn ? <Authenticated /> : <Login />
    }
  </Wrapper>
};

export default withAuthorization(App);
