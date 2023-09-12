import React from 'react';
import type icons from 'bootstrap-icons/font/bootstrap-icons.json';
export type BootstrapIcon = keyof typeof icons;

export const Icon = ({ icon, className }: { icon: BootstrapIcon, className?: string }) => (
  <i className={`bi bi-${icon} ${className ?? ''}`} />
);
