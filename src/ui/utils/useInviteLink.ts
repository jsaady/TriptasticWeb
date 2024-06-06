import { useCallback, useEffect, useState } from 'react';
import { useAsyncHttp } from './useAsync.js';
import { useAlert } from './alerts.js';

export const useCopyInviteLink = () => {
  const alert = useAlert();

  const [fetchInviteLink, { result: inviteLink }] = useAsyncHttp(async ({ get }) => {
    return await get<{ link: string }>('/api/auth/invite-link');
  }, []);

  const copyInviteLink = useCallback(() => {
    if (!inviteLink) fetchInviteLink();
  
    if (inviteLink && navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink.link)
        .then(() => alert('Copied invite link to clipboard'));
    }
  }, [inviteLink]);

  useEffect(() => {
    fetchInviteLink();
  }, []);

  return { copyInviteLink, inviteLink };
};
