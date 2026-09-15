import React from 'react';
import { GovNav } from './GovNav';
import type { UserRole } from '../../types';

export interface GovSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole?: UserRole;
  selectedProjectName?: string | null;
}

export const GovSidebar: React.FC<GovSidebarProps> = (props) => {
  return <GovNav {...props} />;
};

export default GovSidebar;
