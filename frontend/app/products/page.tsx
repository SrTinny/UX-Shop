import React, { Suspense } from 'react';
import ProductsClient from './ProductsClient';
import ProductsPageSkeleton from '@/app/_components/ProductsPageSkeleton';

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsClient />
    </Suspense>
  );
}
