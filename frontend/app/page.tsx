import React, { Suspense } from 'react';
import ProductsPage from './products/page';

export default function Page() {
	return (
		<Suspense fallback={null}>
			<ProductsPage />
		</Suspense>
	);
}

