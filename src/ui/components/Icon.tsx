import React from 'react';
import type icons from 'bootstrap-icons/font/bootstrap-icons.json';
export type BootstrapIcon = keyof typeof icons;

export const Icon = ({ icon }: { icon: BootstrapIcon }) => (
  <i className={`bi bi-${icon}`} />
);
