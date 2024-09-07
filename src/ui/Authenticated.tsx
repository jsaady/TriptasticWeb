import { UserRole } from '@api/features/users/userRole.enum.js';
import { useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { LinkNavBarItem, NavBar, OnClickNavBarItem } from './components/NavBar.js';
import { Sidebar, withSidebar } from './components/SideBar.js';
import { useNotifications, withNotifications } from './features/notifications/useNotifications.js';
import { useAuthorization } from './utils/useAuth.js';
import { withGeolocation } from './utils/useGeolocation.js';
import { useCopyInviteLink } from './utils/useInviteLink.js';
import { Spinner } from './components/Spinner.js';
import { useSpinner } from './utils/useSpinner.js';
export const Authenticated = withGeolocation(withSidebar(withNotifications(() => {
  const { logout, loggedIn, loading, me } = useAuthorization();
  const { enabled, supported, subscribe, unsubscribe } = useNotifications();

  const { pathname } = useLocation();

  const { copyInviteLink, inviteLink } = useCopyInviteLink();

  const subscribeButtonText = useMemo(() => {
    return !enabled ? 'Subscribe' : 'Unsubscribe';
  }, [enabled]);

  const navItems = useMemo<LinkNavBarItem[]>(() => {
    return pathname === '/map' ? [{
      icon: 'list',
      label: 'View as list',
      link: '/list'
    }] : [{
      icon: 'edit-2',
      label: 'View as map',
      link: '/map'
    }];
  }, [pathname]);

  const adminItems = useMemo<(LinkNavBarItem|OnClickNavBarItem)[]>(() => {
    return me?.role === UserRole.ADMIN ? [{
      icon: 'users',
      label: 'User Admin',
      link: '/admin/users'
    } as const] : [];
  }, [me]);

  const userItems = useMemo<(LinkNavBarItem|OnClickNavBarItem)[]>(() => {
    return me?.role === UserRole.GUEST ? [] : [{
      icon: 'lock',
      label: 'Account',
      link: '/account'
    } as const, {
      icon: 'bell',
      label: subscribeButtonText,
      onClick: enabled ? unsubscribe : subscribe,
      disabled: !supported
    } as const, {
      icon: 'link',
      label: 'Copy Invite Link',
      onClick: copyInviteLink,
      disabled: !inviteLink
    } as const];
  }, [me, subscribeButtonText, enabled, supported, inviteLink, subscribe, unsubscribe, copyInviteLink]);

  const logoutItem = useMemo<OnClickNavBarItem[]>(() => [{
    icon: 'log-out',
    label: 'Logout',
    onClick: logout
  }], [logout]);

  const rightItems = useMemo<(OnClickNavBarItem|LinkNavBarItem)[]>(() => {
    return [
      ...userItems,
      ...adminItems,
      ...logoutItem
    ]
  }, [logout, supported, subscribeButtonText, enabled, subscribe, unsubscribe]);

  const [spinning] = useSpinner();
  
  if (loading) return 'Loading...';
  
  if (loggedIn === false) {
    return <Navigate to="/login" replace />;
  }

  return <div className='flex flex-col lg:max-w-[75em] lg:m-auto'>
    <NavBar name='Triptastic' navItems={navItems} rightIcon='user' rightItems={rightItems} />
    <Spinner active={spinning} />
    <div className='w-full'>
      <Sidebar />
      <Outlet />
    </div>
  </div>
})));
