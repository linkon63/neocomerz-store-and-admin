"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/admin-api";

export type Section = {
  id: string;
  title: string;
  position: number;
  page: string;
};

export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSections() {
    setIsLoading(true);
    try {
      setSections(await apiRequest<Section[]>("/campaigns/sections"));
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSections();
  }, []);

  return { sections, isLoading, error, loadSections };
}
