import { Input } from '@ui/components/Input.js';
import { useAuthorization } from '@ui/utils/useAuth.js';
import { UpdatePasswordForm } from '../auth/UpdatePasswordForm.js';

export const Account = () => {
  const { me } = useAuthorization();

  return <div className="mx-6 mt-6">
    <h1>Account</h1>

    <Input disabled label="Email" value={me?.email} />

    <UpdatePasswordForm />
  </div>
};