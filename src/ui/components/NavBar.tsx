import { Link, NavLink } from 'react-router-dom';
import { Clickable } from './Clickable.js';
import { Dropdown } from './Dropdown.js';
import { FeatherIcon, Icon } from './Icon.js';

export interface NavBarItem {
  icon: FeatherIcon;
  label: string;
  iconVisible?: boolean;
  disabled?: boolean;
}

export interface LinkNavBarItem extends NavBarItem {
  link: string;
}

export interface OnClickNavBarItem extends NavBarItem {
  onClick: () => void;
}

export interface NavBarProps {
  navItems: LinkNavBarItem[];
  rightIcon: FeatherIcon;
  rightItems: (LinkNavBarItem|OnClickNavBarItem)[];
}

export const NavBarItem = ({icon, label, iconVisible, ...rest}: LinkNavBarItem|OnClickNavBarItem) => {
  return <Clickable link={'link' in rest ? rest.link : undefined as any} onClick={'onClick' in rest ? rest.onClick : undefined as any} disabled={rest.disabled}>
    <div className="flex flex-row items-center p-4 text-lg">
      {iconVisible && <Icon icon={icon} className="mr-2" />}
      <div>{label}</div>
    </div>
  </Clickable>
}


export const NavBar = ({ navItems, rightIcon, rightItems }: NavBarProps) => (
  <div className='w-full border-b flex justify-between sticky top-0 dark:border-neutral-700'>
    <div className='flex'>
      <Link to='/'>
        <h2 className='px-4 py-6'>Noter</h2>
      </Link>
    </div>
    <div className='px-4 flex items-center flex-grow'>
      {navItems.map(({ link, ...item }, i) => (
        <NavLink key={i} className={({ isActive }) => isActive ? 'font-bold' : ''} to={link}>
          <div className="flex flex-row items-center p-4 text-lg">
            {item.label}
          </div>
        </NavLink>
      ))}
    </div>

    <div className='flex px-4 items-center'>
      <Dropdown trigger={{ icon: rightIcon, className: 'bg-transparent hover:bg-transparent hover:text-white dark:text-neutral-400 text-black' }}>
        {rightItems.map((item, i) => (
          <NavBarItem {...item} key={i} iconVisible />
        ))}
      </Dropdown>
    </div>
  </div>
);
