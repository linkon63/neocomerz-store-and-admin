"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import StorefrontFooter from "./storefront-footer";
import StorefrontHeader from "./storefront-header";
import { WishlistProvider } from "./wishlist-context";
import FAQModal from "@/components/FAQModal";
import PolicyModal from "@/components/PolicyModal";
import { PolicyKey } from "@/types/policy";

export default function StorefrontChrome({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const isAdminRoute = pathname.startsWith("/admin");
	const isProfileRoute = pathname.startsWith("/profile");

	const [footerHeight, setFooterHeight] = useState(450);
	const footerRef = useRef<HTMLElement>(null);

	const [isFAQOpen, setIsFAQOpen] = useState(false);
	const [policyModal, setPolicyModal] = useState({ isOpen: false, policyId: "", policyTitle: "" });

	useEffect(() => {
		const footer = footerRef.current;
		if (!footer) return;

		// Parallax only runs on large screens (lg+); on mobile the footer is
		// in normal flow, so the reveal margin must be 0.
		const isDesktop = window.matchMedia("(min-width: 1024px)");

		const updateFooterHeight = () =>
			setFooterHeight(isDesktop.matches ? footer.clientHeight : 0);

		// Set initial height and keep it in sync as the footer reflows.
		updateFooterHeight();
		const observer = new ResizeObserver(updateFooterHeight);
		observer.observe(footer);
		isDesktop.addEventListener("change", updateFooterHeight);
		return () => {
			observer.disconnect();
			isDesktop.removeEventListener("change", updateFooterHeight);
		};
	}, [isAdminRoute, isProfileRoute]);

	if (isAdminRoute) {
		return children;
	}

	if (isProfileRoute) {
		return (
			<AuthProvider>
				<WishlistProvider>
					<CartProvider>
						<div className="relative z-10 bg-white shadow-2xl">
							<StorefrontHeader />
							{children}
						</div>
					</CartProvider>
				</WishlistProvider>
			</AuthProvider>
		);
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
						<StorefrontFooter
							onSetIsFAQOpen={() => setIsFAQOpen(true)}
							onOpenPolicy={(id: string, title: string) => setPolicyModal({ isOpen: true, policyTitle: title, policyId: id })}
							ref={footerRef}
						/>

						{/* FAQ Modal */}
						<FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />

						{/* Policy Modal */}
						<PolicyModal
							isOpen={policyModal.isOpen}
							policyId={policyModal.policyId as PolicyKey}
							policyTitle={policyModal.policyTitle}
							onClose={() =>
								setPolicyModal({ ...policyModal, isOpen: false })
							}
						/>
					</div>
				</CartProvider>
			</WishlistProvider>
		</AuthProvider>
	);
}