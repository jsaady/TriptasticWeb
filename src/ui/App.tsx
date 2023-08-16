import React, { useEffect } from 'react';
import { Authenticated } from './Authenticated.js';
import { Login } from './Login.js';
import { Wrapper } from './Wrapper.js';
import { useAsyncHttp } from './utils/useAsync.js';
import { useAuthorization, withAuthorization } from './utils/useAuth.js';

const App = () => {
  const { loggedIn, setLoggedIn } = useAuthorization();

  const [doFetch, { result, loading, error }] = useAsyncHttp(async ({ get }) => {
    await get('/api/auth/me')
    setLoggedIn(true);
  }, [setLoggedIn]);

  useEffect(() => {
    doFetch();
  }, []);

  useEffect(() => {
    console.log(loggedIn)
  }, [loggedIn]);

  if (loading) return 'Loading...';

  return <Wrapper showGradient={!loggedIn}>
    {
      loggedIn ? <Authenticated /> : <Login />
    }
  </Wrapper>
};

export default withAuthorization(App);
