export interface NavItem {
  id: string;
  label: string;
  icon: string;
  count?: number;
  isAlert?: boolean;
  isActive?: boolean;
  route?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}