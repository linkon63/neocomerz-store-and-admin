"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import StorefrontFooter from "./storefront-footer";
import StorefrontHeader from "./storefront-header";
import { WishlistProvider } from "./wishlist-context";

export default function StorefrontChrome({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const isAdminRoute = pathname.startsWith("/admin");

	const [footerHeight, setFooterHeight] = useState(450);
	const footerRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const footer = footerRef.current;
		if (!footer) return;

		const updateFooterHeight = () => setFooterHeight(footer.clientHeight);

		// Set initial height and keep it in sync as the footer reflows.
		updateFooterHeight();
		const observer = new ResizeObserver(updateFooterHeight);
		observer.observe(footer);
		return () => observer.disconnect();
	}, [isAdminRoute]);

	if (isAdminRoute) {
		return children;
	}

	return (
		<AuthProvider>
			<WishlistProvider>
				<CartProvider>
					<div
						className="relative z-10 bg-white shadow-2xl"
						style={{ marginBottom: `${footerHeight}px` }}
					>
						<StorefrontHeader />
						{children}
						<StorefrontFooter ref={footerRef} />
					</div>
				</CartProvider>
			</WishlistProvider>
		</AuthProvider>
	);
}
