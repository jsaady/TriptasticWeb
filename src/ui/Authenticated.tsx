import { useMemo, useState } from 'react';
import { styled } from 'styled-components';
import { useNotifications, withNotifications } from './features/notifications/useNotifications.js';
import { useAsyncHttp } from './utils/useAsync.js';
import { useAuthorization } from './utils/useAuth.js';
import { WebAuthnDevices } from './features/account/WebAuthnDevices.js';
const AuthenticatedWrapper = styled.div``;

const LogoutButton = styled.button`
  height: 2rem;
  width: 10rem;
  margin: 1rem;
  background-color: darkgrey;
  border: none;
  font-size: 16px;
`;

export const Authenticated = withNotifications(() => {
  const { logout } = useAuthorization();
  const { enabled, supported, subscribe, unsubscribe } = useNotifications();
  const [devicesVisible, setDevicesVisible] = useState(false);

  const subscribeButtonText = useMemo(() => {
    return !enabled ? 'Subscribe' : 'Unsubscribe';
  }, [enabled]);


  return <AuthenticatedWrapper>
    <LogoutButton onClick={logout}>
      Log out
    </LogoutButton>

    <LogoutButton onClick={() => setDevicesVisible(!devicesVisible)}>
      Devices
    </LogoutButton>

    <LogoutButton disabled={!supported} onClick={enabled ? unsubscribe : subscribe}>
      {subscribeButtonText}
    </LogoutButton>
    <h1>Logged in</h1>

    {devicesVisible && <WebAuthnDevices />}
  </AuthenticatedWrapper>
});
