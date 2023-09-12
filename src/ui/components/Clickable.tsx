import { Link } from 'react-router-dom';

export interface ClickableLink {
  link: string;
}

export interface ClickableOnClick {
  onClick: () => void;
}

export interface ClickableProps {
  className?: string;
  children: React.ReactNode;
  role?: string;
  disabled?: boolean;
}

export const Clickable = (props: ClickableProps & (ClickableLink | ClickableOnClick)) => {
  return 'link' in props && props.link ?
    <Link aria-disabled={props.disabled} className={`${props.disabled ? 'text-neutral-300 dark:text-neutral-500 pointer-events-none cursor-not-allowed' : ''} ${props.className}`} to={props.link} role={props.role}>{props.children}</Link> :
    <a aria-disabled={props.disabled} className={`${props.disabled ? 'text-neutral-300 dark:text-neutral-500 pointer-events-none cursor-not-allowed' : ''} ${props.className + ' cursor-pointer'}`} onClick={'onClick' in props && props.onClick ? props.onClick : () => {}} role={props.role}>{props.children}</a>;
};