import { Input } from '@ui/components/Input.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { UpdatePasswordForm } from '../auth/UpdatePasswordForm.js';

export const Account = () => {
  const { me } = useAuthorization();

  return <div>
    <h1>Account</h1>

    <Input disabled label="Email" value={me?.email} />

    <UpdatePasswordForm />
  </div>
};