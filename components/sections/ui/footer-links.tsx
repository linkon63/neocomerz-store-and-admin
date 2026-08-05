import { IoLocationOutline } from "react-icons/io5";
import { fetchStorePolicies, type PolicyKey, type StorePolicies } from "@/lib/shop-api";
import { PolicyLinksBar, type ActivePolicy } from "./policy-links-bar";

const POLICY_SLOTS: { key: PolicyKey; defaultLabel: string }[] = [
  { key: "delivery",     defaultLabel: "Delivery Policy"      },
  { key: "refund",       defaultLabel: "Refund Policy"        },
  { key: "return",       defaultLabel: "Return Policy"        },
  { key: "cancellation", defaultLabel: "Cancellation Policy"  },
  { key: "privacy",      defaultLabel: "Privacy Policy"       },
  { key: "terms",        defaultLabel: "Terms and Conditions" },
];

function resolveActiveLinks(policies: StorePolicies | null): ActivePolicy[] {
  if (!policies) return [];
  return POLICY_SLOTS.reduce<ActivePolicy[]>((acc, slot) => {
    const entry = policies[slot.key];
    if (!entry?.content?.trim()) return acc;
    acc.push({ key: slot.key, label: entry.title?.trim() || slot.defaultLabel, entry });
    return acc;
  }, []);
}

export default async function FooterLinks() {
  const activeLinks = resolveActiveLinks(await fetchStorePolicies());

  return (
    <div className="pt-6 border-t border-white/20">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="hidden md:flex md:w-[160px]" />

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <PolicyLinksBar links={activeLinks} />
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-white md:w-[160px] md:justify-end">
            <IoLocationOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-white" />
            <span className="font-['Gotham'] text-[11px] sm:text-xs whitespace-nowrap">
              Pan Pacific Sonargaon
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="font-['Gotham'] text-white text-xs">
            © {new Date().getFullYear()} London Tea Exchange. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
