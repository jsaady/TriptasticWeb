import { useAsyncHttp } from '@ui/utils/useAsync.js';
import { ErrorBanner } from '../auth/Banner.js';
import { useEffect, useState } from 'react';
import { CreateUserDTO, UserDTO } from '@api/features/users/users.dto.js';
import { LinkButton, SmallButton } from '@ui/components/Button.js';
import { Icon } from '@ui/components/Icon.js';
import { ManageUserDialog } from './managerUserDialog.js';
import { Serialized } from '../../../common/serialized.js';

export const UserAdminPage = () => {
  const [currentEditUser, setCurrentEditUser] = useState<UserDTO | null>(null);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);

  const [createUser, { loading: creatingUser, error: _errorCreatingUser }] = useAsyncHttp(({ post }, user: CreateUserDTO) => {
    return post<UserDTO>('/api/admin/user', user);
  }, []);

  const [updateUser, { loading: updatingUser, error: _errorUpdatingUser }] = useAsyncHttp(({ put }, user: CreateUserDTO) => {
    return put<UserDTO>('/api/admin/user/' + currentEditUser?.id, user);
  }, []);

  const [fetchUser, { result: users, loading, error }] = useAsyncHttp(async ({ get }) => {
    const data = await get<Serialized<UserDTO>[]>('/api/admin/user');
    return data.map(r => ({
      ...r,
      lastLoginDate: r.lastLoginDate ? new Date(r.lastLoginDate) : null
    }))
  }, []);

  useEffect(() => {
    fetchUser();
  }, [creatingUser, updatingUser]);

  const handleNewClick = () => {
    setCurrentEditUser(null);
    setShowEditUserDialog(true);
  };

  const handleEditClick = (user: UserDTO) => {
    setCurrentEditUser(user);
    setShowEditUserDialog(true);
  };

  const closeEditUserDialog = () => {
    setCurrentEditUser(null);
    setShowEditUserDialog(false);
  };

  const handleSaveUser = (user: CreateUserDTO) => {
    if (currentEditUser) {
      updateUser(user);
    } else {
      createUser(user);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <ErrorBanner>{error.message}</ErrorBanner>;

  return <>
    <div className="md:mx-6 md:mt-6 mx-2 mt-2">
      <table className="w-full bg-white dark:bg-neutral-800">
        <thead className="bg-neutral-200 dark:bg-neutral-800">
          <tr className="text-left">
            <th className="py-2 px-4" style={{ width: '30%' }}>Username</th>
            <th className="py-2 px-4" style={{ width: '20%' }}>Last Logged In</th>
            <th className="py-2 px-4" style={{ width: '30%' }}>Role</th>
            <th className="py-2 px-4 align-middle text-center" style={{ width: '20%' }}>
              <SmallButton className='border' onClick={handleNewClick}>
                <Icon icon="plus" />
              </SmallButton>
            </th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.username} className="border-t border-neutral-200 dark:border-neutral-700">
              <td className="py-2 px-4" style={{ width: '30%' }}>{user.username}</td>
              <td className="py-2 px-4" style={{ width: '20%' }}>{user.lastLoginDate?.toLocaleDateString()}</td>
              <td className="py-2 px-4" style={{ width: '30%' }}>{user.role}</td>
              <td className="py-2 px-4 text-center" style={{ width: '20%' }}>
                <LinkButton onClick={() => handleEditClick(user)}>
                  <Icon icon="edit" />
                </LinkButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {showEditUserDialog && <ManageUserDialog user={currentEditUser} saveUser={handleSaveUser} close={closeEditUserDialog} />}
    </>
};
