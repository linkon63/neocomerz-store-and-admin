import type { Metadata } from "next";
import type { ComponentType } from "react";

export type StorefrontConfig = {
  id: string;
  Page: ComponentType;
  metadata: Metadata;
};
