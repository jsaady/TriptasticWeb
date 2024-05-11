import { forwardRef } from 'react';
import { FormItemProps } from '../utils/forms.js';
import { FeatherIcon, Icon } from './Icon.js';
import { SmallButton } from './Button.js';

export interface ButtonSelectOption {
  value: string;
  label: string;
  icon: FeatherIcon;
}

export interface ButtonSelectProps extends FormItemProps {
  options: ButtonSelectOption[];
  className?: string;
}

export const ButtonSelect = forwardRef(({ onChange, name, required, value, options, className }: ButtonSelectProps) => {
  console.log(value);

  return <div className={className}>
    {options.map(option => (
      <SmallButton
        disabled={value === option.value}
        key={option.value}
        type="button"
        title={option.label}
        className={`${option.value === value ? 'bg-indigo-600' : 'bg-indigo-300 hover:bg-indigo-300'}`}
        onClick={() => onChange({
          target: { name, value: option.value }
        })}
      >
        <Icon icon={option.icon} />
        {/* <span>{option.label}</span> */}
      </SmallButton>
    ))}
  </div>
});