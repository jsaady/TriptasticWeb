import { useMemo } from 'react';
import { Navigate, Outlet } from 'react-router';
import { LinkNavBarItem, NavBar, OnClickNavBarItem } from './components/NavBar.js';
import { Sidebar, useSidebar, withSidebar } from './components/SideBar.js';
import { useNotifications, withNotifications } from './features/notifications/useNotifications.js';
import { useAuthorization } from './utils/useAuth.js';
import { withGeolocation } from './utils/useGeolocation.js';
import { UserRole } from '@api/features/users/userRole.enum.js';
import { icon } from 'leaflet';
export const Authenticated = withGeolocation(withSidebar(withNotifications(() => {
  const { logout, loggedIn, loading, me } = useAuthorization();
  const { enabled, supported, subscribe, unsubscribe } = useNotifications();

  const subscribeButtonText = useMemo(() => {
    return !enabled ? 'Subscribe' : 'Unsubscribe';
  }, [enabled]);

  const navItems = useMemo<LinkNavBarItem[]>(() => {
    return [{
      icon: 'edit-2',
      label: 'Home',
      link: '/'
    }];
  }, []);

  const rightItems = useMemo<(OnClickNavBarItem|LinkNavBarItem)[]>(() => {
    return [{
      icon: 'lock',
      label: 'Account',
      link: '/account'
    }, {
      icon: 'bell',
      label: subscribeButtonText,
      onClick: enabled ? unsubscribe : subscribe,
      disabled: !supported
    }, ...(me?.role === UserRole.ADMIN ? [{
      icon: 'users',
      label: 'User Admin',
      link: '/admin/users'
    }] : []), {
      icon: 'log-out',
      label: 'Logout',
      onClick: logout
    }];
  }, [logout, supported, subscribeButtonText, enabled, subscribe, unsubscribe]);

  
  if (loading) return 'Loading...';
  
  if (loggedIn === false) {
    return <Navigate to="/login" replace />;
  }

  return <div className='flex flex-col lg:max-w-[75em] lg:m-auto'>
    <NavBar name='Triptastic' navItems={navItems} rightIcon='user' rightItems={rightItems} />
    <div className='w-full'>
      <Sidebar />
      <Outlet />
    </div>
  </div>
})));
