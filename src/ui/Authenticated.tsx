import { useMemo } from 'react';
import { Navigate, Outlet } from 'react-router';
import { LinkNavBarItem, NavBar, OnClickNavBarItem } from './components/NavBar.js';
import { Sidebar, useSidebar, withSidebar } from './components/SideBar.js';
import { useNotifications, withNotifications } from './features/notifications/useNotifications.js';
import { useAuthorization } from './utils/useAuth.js';
export const Authenticated = withSidebar(withNotifications(() => {
  const { logout, loggedIn, loading } = useAuthorization();
  const { enabled, supported, subscribe, unsubscribe } = useNotifications();

  const subscribeButtonText = useMemo(() => {
    return !enabled ? 'Subscribe' : 'Unsubscribe';
  }, [enabled]);

  const navItems = useMemo<LinkNavBarItem[]>(() => {
    return [{
      icon: 'home',
      label: 'Home',
      link: '/'
    }, {
      icon: 'edit-2',
      label: 'Notes',
      link: '/notes'
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
    }, {
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
    <NavBar navItems={navItems} rightIcon='user' rightItems={rightItems} />
    <div className='flex'>
      <Sidebar />
      <Outlet />
    </div>
  </div>
}));
