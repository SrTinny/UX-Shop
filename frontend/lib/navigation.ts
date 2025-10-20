export type NavItem = {
  label: string;
  href?: string;
  children?: Array<{ label: string; href: string }>;
};

export const navigation: NavItem[] = [
  { label: 'Produtos', href: '/products' },
  {
    label: 'Categorias',
    children: [
      { label: 'Eletrônicos', href: '/products?category=eletronicos' },
      { label: 'Moda', href: '/products?category=moda' },
      { label: 'Casa', href: '/products?category=casa' },
    ],
  },
  { label: 'Sobre', href: '/about' },
];

export default navigation;
