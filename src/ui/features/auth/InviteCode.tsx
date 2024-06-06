import { setCurrentInviteCode } from '@ui/utils/inviteCodeStorage.js';
import { Navigate, useParams } from 'react-router';

export const InviteCode = () => {
  const params = useParams<{ code: string }>();

  if (params.code) {
    setCurrentInviteCode(params.code);
  }

  return <Navigate to="/home" />;
}
