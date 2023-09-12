import { useRef, useState } from 'react';
import { Button } from './Button.js';
import { BootstrapIcon, Icon } from './Icon.js';

interface OnClickDropdownItem {
  onClick: () => void;
}

interface LinkItem {
  link: string;
}

interface Item {
  label: string;
  icon?: BootstrapIcon;
}

interface Trigger {
  className?: string;
}

interface IconTrigger {
  icon: BootstrapIcon;
}

interface LabelTrigger {
  label: string;
}


export interface DropdownProps {
  children?: React.ReactNode;
  trigger: Trigger & (IconTrigger | LabelTrigger);
}

export const Dropdown = ({ trigger, children }: DropdownProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    if (!expanded) {
      const handler = (e: MouseEvent) => {
        setExpanded(s => !s);
        document.removeEventListener('click', handler);
      };
      setTimeout(() => {
        document.addEventListener('click', handler);
      });
      setExpanded(s => !s);
    }
  };

  return <div className='relative inline-block text-left'>
    <Button className={(trigger.className) || ' px-4 py-2 text-white rounded-md hover:bg-neutral-700'} onClick={handleExpandClick}>{'label' in trigger && trigger.label}{'icon' in trigger && <Icon className='text-2xl' icon={trigger.icon} />}</Button>

    <div className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg dark:shadow-neutral-700 dark:bg-neutral-700 bg-white ring-1 ring-black dark:ring-neutral-500 ring-opacity-5 overflow-hidden transition-all ${expanded ? 'h-100 opacity-100' : 'h-0 opacity-0'}`}>
      {children}
    </div>
  </div>
};