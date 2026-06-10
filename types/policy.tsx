
export interface PolicyItem {
  title: string;
  content: string;
}

export interface PolicyData {
  id: string;

  delivery: PolicyItem | null;
  return: PolicyItem | null;
  refund: PolicyItem | null;
  cancellation: PolicyItem | null;
  privacy: PolicyItem | null;
  terms: PolicyItem | null;

  createdAt: string;
  updatedAt: string;
}

export type PolicyKey =
  | "delivery"
  | "return"
  | "refund"
  | "cancellation"
  | "privacy"
  | "terms";

export interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyId: PolicyKey;
  policyTitle: string;
}