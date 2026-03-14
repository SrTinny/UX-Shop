export type NavItem = {
  label: string;
  href?: string;
  children?: Array<{ label: string; href: string }>;
};

export const navigation: NavItem[] = [
  { label: 'Produtos', href: '/products' },
  { label: 'Sobre', href: '/about' },
];

export default navigation;
