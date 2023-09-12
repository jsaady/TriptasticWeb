import { Input } from '../../components/Input.js';
import { useAuthorization } from '../../utils/useAuth.js';

export const Account = () => {
  const { me } = useAuthorization();

  console.log(me);

  return <div>
    <h1>Account</h1>

    <Input disabled label="Email" value={me?.email} />
  </div>
};