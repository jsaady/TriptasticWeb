import React from 'react';
import { styled } from 'styled-components';
import { useAsyncHttp } from './utils/useAsync.js';
import { useAuthorization } from './utils/useAuth.js';
const AuthenticatedWrapper = styled.div``;

const LogoutButton = styled.button`
  height: 2rem;
  width: 10rem;
  margin: 1rem;
  background-color: darkgrey;
  border: none;
  font-size: 16px;
`;

export const Authenticated = () => {
  const { setLoggedIn, me } = useAuthorization();
  const [handleLogout] = useAsyncHttp(async ({ post }) => {    
    await post('/api/auth/logout', {});

    setLoggedIn(false);
  }, [setLoggedIn]);

  return <AuthenticatedWrapper>
    <LogoutButton onClick={handleLogout}>
      Log out
    </LogoutButton>
    <h1>Logged in {JSON.stringify(me)}</h1>
  </AuthenticatedWrapper>
};
