import React, { Suspense } from 'react';
import ProductsPage from './products/page';
import ProductsPageSkeleton from './_components/ProductsPageSkeleton';

export default function Page() {
	return (
		<Suspense fallback={<ProductsPageSkeleton />}>
			<ProductsPage />
		</Suspense>
	);
}

