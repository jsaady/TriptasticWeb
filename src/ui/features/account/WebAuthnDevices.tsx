import { useCallback, useEffect, useState } from 'react';
import { useAsyncHttp } from '../../utils/useAsync.js';
import { useAuthorization } from '../../utils/useAuth.js';
import { WebAuthnLoginForm } from '../auth/WebAuthnLoginForm.js';
import { LoginResponse } from '../auth/types.js';

export const WebAuthnDevices = () => {
  const [newDeviceVisible, setNewDeviceVisible] = useState(false);
  const { handleLoginResponse } = useAuthorization();

  const [fetchDevices, { result: devices, loading }] = useAsyncHttp(({ get }) => {
    return get<any[]>('/api/auth/web-authn/devices');
  }, []);

  const [removeDevice, { loading: removeDeviceLoading }] = useAsyncHttp(async ({ del }, id: number) => {
    await del<any[]>(`/api/auth/web-authn/devices/${id}`);

    fetchDevices();
  }, []);

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleSubmit = useCallback((res: LoginResponse) => {
    setNewDeviceVisible(false);
    handleLoginResponse(res);
    fetchDevices();
  }, [handleLoginResponse]);

  const handleCancel = useCallback(() => setNewDeviceVisible(false), []);
  const handleNewClick = useCallback(() => setNewDeviceVisible(true), []);

  if (loading) return "Loading...";

  return <>
    <ul>
      {devices?.map(device => (
        <li key={device.id}>
          {device.name}
          <button onClick={() => removeDevice(device.id)}>
            x
          </button>
        </li>
      ))}
    </ul>
    {!newDeviceVisible && <button onClick={handleNewClick}>Add new device</button>}
    {newDeviceVisible && <>
      <WebAuthnLoginForm onRegistered={handleSubmit} />
      <button onClick={handleCancel}>Cancel</button>
    </>}
  </>
}