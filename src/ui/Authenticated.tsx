import { useEffect, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router';
import { LinkNavBarItem, NavBar, OnClickNavBarItem } from './components/NavBar.js';
import { useNotifications, withNotifications } from './features/notifications/useNotifications.js';
import { useAuthorization } from './utils/useAuth.js';
import { Sidebar, useSidebar, withSidebar } from './components/SideBar.js';
export const Authenticated = withSidebar(withNotifications(() => {
  const { logout, loggedIn, loading } = useAuthorization();
  const { enabled, supported, subscribe, unsubscribe } = useNotifications();
  const { setItems } = useSidebar();

  const subscribeButtonText = useMemo(() => {
    return !enabled ? 'Subscribe' : 'Unsubscribe';
  }, [enabled]);

  const navItems = useMemo<LinkNavBarItem[]>(() => {
    return [{
      icon: 'house',
      label: 'Home',
      link: '/'
    }];
  }, []);

  const rightItems = useMemo<(OnClickNavBarItem|LinkNavBarItem)[]>(() => {
    return [{
      icon: 'fingerprint',
      label: 'Account',
      link: '/account'
    }, {
      icon: 'bell',
      label: subscribeButtonText,
      onClick: enabled ? unsubscribe : subscribe,
      disabled: !supported
    }, {
      icon: 'box-arrow-right',
      label: 'Logout',
      onClick: logout
    }];
  }, [logout, supported, subscribeButtonText, enabled, subscribe, unsubscribe]);

  
  if (loading) return 'Loading...';
  
  if (loggedIn === false) {
    return <Navigate to="/login" replace />;
  }

  return <div className='flex flex-col lg:max-w-[75em] lg:m-auto'>
    <NavBar navItems={navItems} rightIcon='person-circle' rightItems={rightItems} />
    <div className='flex'>
      <Sidebar />
      <Outlet />
    </div>
  </div>
}));
