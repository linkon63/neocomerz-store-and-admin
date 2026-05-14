export interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

export interface DropdownItem {
  label: string;
  href: string;
}

export interface NavigationProps {
  navItems: NavItem[];
  sylhetiTeaItems: DropdownItem[];
}
