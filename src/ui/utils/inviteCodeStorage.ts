const lsKey = 'inviteCode';
export const setCurrentInviteCode = (inviteCode: string) => {
  localStorage.setItem(lsKey, inviteCode);
};

export const getCurrentInviteCode = () => {
  return localStorage.getItem(lsKey);
};
