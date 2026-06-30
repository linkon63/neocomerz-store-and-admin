"use client";

import { useEffect, useState } from "react";
import { type DateValueType } from "react-tailwindcss-datepicker";
import {
  apiRequest,
  type ReportOverview,
} from "../../../lib/admin-api";
import { toISODate } from "../../../lib/utils";

export function useReportsOverview() {
  const currentYear = new Date().getFullYear();
  const [report, setReport] = useState<ReportOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateValue, setDateValue] = useState<DateValueType>({
    startDate: new Date(currentYear, 0, 1),
    endDate: new Date(currentYear, 11, 31),
  });

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (dateValue?.startDate) {
          params.set("startDate", toISODate(new Date(dateValue.startDate)));
        }
        if (dateValue?.endDate) {
          params.set("endDate", toISODate(new Date(dateValue.endDate)));
        }

        const data = await apiRequest<ReportOverview>(
          `/reports/overview?${params.toString()}`,
        );
        if (!active) return;
        setReport(data);
      } catch (err) {
        if (active)
          setError(
            err instanceof Error ? err.message : "Failed to load report overview",
          );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [dateValue]);

  return { report, isLoading, error, dateValue, setDateValue };
}
