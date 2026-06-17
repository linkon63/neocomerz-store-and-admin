"use client";
import { useFetchSettings } from "@/hooks/useFetchSettings";
import Link from "@/components/LocaleLink";
import { FaCcPaypal, FaCcVisa, FaFacebookF, FaInstagram, FaLinkedinIn, FaStripe, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useI18n } from "@/lib/i18n/I18nProvider";

const footerGroups = [
	{
		titleKey: "footer.customerService",
		links: [
			{ id: "faq", labelKey: "footer.links.faq", href: "#" },
			{ id: "wishlist", labelKey: "footer.links.wishlist", href: "/wishlist" },
			{ id: "delivery", labelKey: "footer.links.delivery", href: "#" },
			{ id: "terms", labelKey: "footer.links.terms", href: "#" },
		],
	},
	{
		titleKey: "footer.whoWeAre",
		links: [
			{ id: "about-us", labelKey: "footer.links.about", href: "/about" },
			{ id: "contacts", labelKey: "footer.links.contacts", href: "/contact" },
			{ id: "our-stores", labelKey: "footer.links.ourStores", href: "/about" },
			{ id: "news-blog", labelKey: "footer.links.newsBlog", href: "/news" },
		],
	},
	{
		titleKey: "footer.policies",
		links: [
			{ id: "refund", labelKey: "footer.links.refund", href: "#" },
			{ id: "return", labelKey: "footer.links.return", href: "#" },
			{ id: "cancellation", labelKey: "footer.links.cancellation", href: "#" },
			{ id: "privacy", labelKey: "footer.links.privacy", href: "#" },
		],
	},
];


export default function StorefrontFooter({
	ref,
	onOpenPolicy,
	onSetIsFAQOpen

}: {
	ref?: React.Ref<HTMLElement>;
	onOpenPolicy: (id: string, title: string) => void;
	onSetIsFAQOpen: () => void;
}) {

	const { data, isLoading } = useFetchSettings();
	const { t } = useI18n();

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
	const handleOpenPolicy = (id: string, label: string) => {
		onOpenPolicy(id, label);
	}


	return (
		<footer
			ref={ref}
			className="relative w-full bg-white px-4 py-14 lg:fixed lg:bottom-0 lg:left-0 lg:-z-10 lg:py-20"
		>
			<div className="mx-auto container">
				<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1.2fr_1fr]">
					{footerGroups.map((group) => (
						<div key={group.titleKey}>
							<h2 className="text-sm font-bold uppercase tracking-[0.02em] text-neutral-900">
								{t(group.titleKey)}
							</h2>
							<ul className="mt-5 space-y-2">
								{group.links.map((link) => (
									<li key={link.id}>
										{link.href === "#" ? (
											<button
												onClick={link.id === "faq" ? handleOpenFAQ : () => handleOpenPolicy(link.id, t(link.labelKey))}
												className="text-sm font-medium uppercase leading-5 text-neutral-400 transition hover:text-neutral-900 sm:text-base text-left"
											>
												{t(link.labelKey)}
											</button>
										) : (
											<Link
												href={link.href}
												className="text-sm font-medium uppercase leading-5 text-neutral-400 transition hover:text-neutral-900 sm:text-base"
											>
												{t(link.labelKey)}
											</Link>
										)}
									</li>
								))}
							</ul>
						</div>
					))}

					<div>
						{
							!isLoading && data?.socialContact && data?.socialContact.length !== 0 &&
							<div>
								<h2 className="text-sm font-bold uppercase tracking-[0.02em] text-neutral-900">
									{t("footer.socialMedia")}
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
								{t("footer.paymentMethods")}
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
					© {data?.copyrightYear} {data?.shopName}
					{data?.parentCompany && (
						<>
							{` | ${t("footer.poweredBy")} `}
							{data?.parentCompanyLink ? (
								<Link
									href={data.parentCompanyLink}
									target="_blank"
									rel="noopener noreferrer"
									className="italic underline text-amber-600 transition-colors hover:text-amber-700"
								>
									{data.parentCompany}
								</Link>
							) : (
								<span className="italic underline text-amber-600">{data.parentCompany}</span>
							)}
						</>
					)}
				</div>
			</div>

		</footer>
	);
}
