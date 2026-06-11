"use client";
import { useFetchSettings } from "@/hooks/useFetchSettings";
import { getPolicyTitle, type PolicyData, type PolicyKey } from "@/types/policy";
import Link from "next/link";
import { FaCcPaypal, FaCcVisa, FaFacebookF, FaInstagram, FaLinkedinIn, FaStripe, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

type FooterLink =
	| { id: "faq"; label: string; href: "#" }
	| { id: "wishlist" | "about-us" | "contacts" | "our-stores" | "institutional-blog"; label: string; href: string }
	| { id: PolicyKey; label: string; href: "#"; policy: true };

const footerGroups: { title: string; links: FooterLink[] }[] = [
	{
		title: "Customer Service",
		links: [
			{ id: "faq", label: "FAQ", href: "#" },
			{ id: "wishlist", label: "Wishlist", href: "/wishlist" },
			{ id: "delivery", label: "Delivery Policy", href: "#", policy: true },
			{ id: "terms", label: "Terms and Conditions", href: "#", policy: true },
		],
	},
	{
		title: "Who We Are",
		links: [
			{ id: "about-us", label: "About Us", href: "/about" },
			{ id: "contacts", label: "Contacts", href: "/contact" },
			{ id: "our-stores", label: "Our Stores", href: "/about" },
			{ id: "institutional-blog", label: "Institutional Blog", href: "/about" },
		],
	},
	{
		title: "Policies",
		links: [
			{ id: "return", label: "Refund & Return", href: "#", policy: true },
			{ id: "cancellation", label: "Cancellation Policy", href: "#", policy: true },
			{ id: "privacy", label: "Privacy Policy", href: "#", policy: true },
		],
	},
];


export default function StorefrontFooter({
	ref,
	onOpenPolicy,
	onSetIsFAQOpen,
	policies

}: {
	ref?: React.Ref<HTMLElement>;
	onOpenPolicy: (id: PolicyKey, title: string) => void;
	onSetIsFAQOpen: () => void;
	policies?: PolicyData | null;
}) {

	const { data, isLoading } = useFetchSettings();

	const socialIcons = {
		facebook: FaFacebookF,
		instagram: FaInstagram,
		linkedin: FaLinkedinIn,
		twitter: FaXTwitter,
		youtube: FaYoutube,
		tiktok: FaTiktok,
	};

	// Handle Open Faq modal
	const handleOpenFAQ = () => {
		onSetIsFAQOpen();
	}

	// Handle Open Policy
	const handleOpenPolicy = (id: PolicyKey) => {
		onOpenPolicy(id, getPolicyTitle(policies, id));
	}

	return (
		<footer
			ref={ref}
			className="relative w-full bg-white px-4 py-14 lg:fixed lg:bottom-0 lg:left-0 lg:-z-10 lg:py-20"
		>
			<div className="mx-auto container">
				<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1.2fr_1fr]">
					{footerGroups.map((group) => (
						<div key={group.title}>
							<h2 className="text-sm font-bold uppercase tracking-[0.02em] text-neutral-900">
								{group.title}
							</h2>
							<ul className="mt-5 space-y-2">
								{group.links.map((link) => {
									const label = "policy" in link ? getPolicyTitle(policies, link.id) : link.label;

									return (
									<li key={link.label}>
										{link.href === "#" ? (
											<button
												onClick={link.id === "faq" ? handleOpenFAQ : () => handleOpenPolicy(link.id as PolicyKey)}
												className="text-sm font-medium uppercase leading-5 text-neutral-400 transition hover:text-neutral-900 sm:text-base text-left"
											>
												{label}
											</button>
										) : (
											<Link
												href={link.href}
												className="text-sm font-medium uppercase leading-5 text-neutral-400 transition hover:text-neutral-900 sm:text-base"
											>
												{label}
											</Link>
										)}
									</li>
								)})}
							</ul>
						</div>
					))}

					<div>
						{
							!isLoading && data?.socialContact && Object.values(data.socialContact).some(Boolean) &&
							<div>
								<h2 className="text-sm font-bold uppercase tracking-[0.02em] text-neutral-900">
									Social Media
								</h2>
								<div className="mt-5 flex gap-3">
									{isLoading ? (
										Array.from({ length: 4 }).map((_, index) => (
											<div
												key={index}
												className="h-10 w-10 animate-pulse rounded-full bg-neutral-200"
											/>
										))
									) : (
										Object.entries(data?.socialContact || {}).map(([platform, url]) => {
											if (!url) return null;

											const Icon =
												socialIcons[platform as keyof typeof socialIcons];

											if (!Icon) return null;

											return (
												<Link
													key={platform}
													href={url}
													target="_blank"
													rel="noopener noreferrer"
													className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-900 transition hover:border-neutral-900"
													aria-label={platform}
												>
													<Icon className="text-sm" />
												</Link>
											);
										})
									)}
								</div>


							</div>
						}
						<div>
							<h2 className="mt-9 text-sm font-bold uppercase tracking-[0.02em] text-neutral-900">
								Payment Methods
							</h2>
							<div className="mt-4 flex flex-wrap gap-4 items-center">

								<FaCcVisa className="text-4xl text-neutral-800" />
								<FaCcPaypal className="text-4xl text-neutral-800" />
								<FaStripe className="text-4xl text-neutral-800" />
							</div>
						</div>
					</div>

				</div>

				<div className="mt-12 border-t border-neutral-300 pt-10 text-xs font-medium text-neutral-400">
					© {data?.copyrightYear} {data?.shopName} | Powered by{" "}
					{data?.parentCompanyLink ? (
						<Link
							href={data.parentCompanyLink}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-neutral-900 transition-colors"
						>
							{data.parentCompany}
						</Link>
					) : (
						data?.parentCompany
					)}
				</div>
			</div>

		</footer>
	);
}
