import { UserRole } from '@api/features/users/userRole.enum.js';
import { CreateUserDTO, UserDTO } from '@api/features/users/users.dto.js';
import { ButtonSelect, ButtonSelectOption } from '@ui/components/ButtonSelect.js';
import { Input } from '@ui/components/Input.js';
import { useForm } from '@ui/utils/forms.js';
import { StyledModal } from '@ui/utils/modals.js';
import { useCallback } from 'react';

export interface ManageUserDialogProps {
  user: UserDTO | null;
  saveUser: (user: CreateUserDTO) => void;
  close: () => void;
}

export const ManageUserDialog = ({ user, saveUser, close }: ManageUserDialogProps) => {
  const { state, stateRef, register, registerForm } = useForm({
    username: user?.username ?? '',
    email: user?.email ?? '',
    isAdmin: user?.role === UserRole.ADMIN,
    password: '',
    needPasswordReset: user?.needPasswordReset ?? false,
    emailConfirmed: user?.emailConfirmed ?? false,
  });

  const submit = useCallback((data: typeof state) => {
    const user: CreateUserDTO = {
      username: data.username,
      email: data.email,
      role: data.isAdmin ? UserRole.ADMIN : UserRole.USER,
      password: data.password,
      needPasswordReset: data.needPasswordReset,
      emailConfirmed: data.emailConfirmed,
    };
    saveUser(user);
    close();
  }, [saveUser, close]);

  const handlePrimaryClick = useCallback(() => {
    submit(stateRef.current);
  }, [submit]);

  return (
    <StyledModal
      onClose={close}
      primaryButtonText='Save'
      onPrimaryClick={handlePrimaryClick}
      title={user ? 'Edit User' : 'New User'}>
      <form {...registerForm(submit)} className="grid grid-cols-2 gap-4 overflow-x-scroll">
        <div>
          <Input
            label="Username"
            {...register('username')}
            defaultValue={state.username}
          />
        </div>
        <div>
          <Input
            label="Email"
            {...register('email')}
            defaultValue={state.email}
          />
        </div>
        <div>
          <Input
            label="Password"
            type="password"
            {...register('password')}
          />
        </div>
        <div>
          <Input
            label="Is Admin"
            type="checkbox"
            className="ring-0 h-5 self-middle w-5"
            checked={state.isAdmin}
            {...register('isAdmin')} />
        </div>
        <div>
          <Input
            label="Need Password Reset"
            type="checkbox"
            className="ring-0 h-5 self-middle w-5"
            checked={state.needPasswordReset}
            {...register('needPasswordReset')}
          />
        </div>
        <div>
          <Input
            label="Email Confirmed"
            type="checkbox"
            checked={state.emailConfirmed}
            className="ring-0 h-5 self-middle w-5"
            {...register('emailConfirmed')}
          />
        </div>
      </form>
    </StyledModal>
  );
};
