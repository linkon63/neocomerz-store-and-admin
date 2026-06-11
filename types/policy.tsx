
export interface PolicyItem {
  title: string;
  content: string;
}

export interface PolicyData {
  id?: string;

  delivery?: PolicyItem | null;
  return?: PolicyItem | null;
  cancellation?: PolicyItem | null;
  privacy?: PolicyItem | null;
  terms?: PolicyItem | null;

  createdAt?: string;
  updatedAt?: string;
}

export type PolicyKey =
  | "delivery"
  | "return"
  | "cancellation"
  | "privacy"
  | "terms";

export const POLICY_ITEMS: { key: PolicyKey; fallbackTitle: string }[] = [
  { key: "delivery", fallbackTitle: "Delivery Policy" },
  { key: "return", fallbackTitle: "Refund & Return" },
  { key: "cancellation", fallbackTitle: "Cancellation Policy" },
  { key: "privacy", fallbackTitle: "Privacy Policy" },
  { key: "terms", fallbackTitle: "Terms and Conditions" },
];

export function getPolicyTitle(
  policies: PolicyData | null | undefined,
  key: PolicyKey,
) {
  const fallback = POLICY_ITEMS.find((item) => item.key === key)?.fallbackTitle ?? key;

  return policies?.[key]?.title?.trim() || fallback;
}

export function getPolicyContent(
  policies: PolicyData | null | undefined,
  key: PolicyKey,
) {
  return policies?.[key]?.content?.trim() || "";
}

export function toPolicySavePayload(policies: PolicyData) {
  return POLICY_ITEMS.reduce<Partial<Record<PolicyKey, PolicyItem>>>((payload, item) => {
    const policy = policies[item.key];

    if (policy) {
      payload[item.key] = {
        title: policy.title ?? "",
        content: policy.content ?? "",
      };
    }

    return payload;
  }, {});
}

export interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyId: PolicyKey;
  policyTitle: string;
  policies?: PolicyData | null;
  isLoading?: boolean;
}
