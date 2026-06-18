import { useCallback, useState } from "react";
import { toast } from "sonner";
import { apiRequest, type AppSettings } from "../../../lib/admin-api";

export function useSettingsSaving() {
  const [saving, setSaving] = useState(false);

  const saveSettings = useCallback(
    async (
      endpoint: string,
      body: Record<string, unknown>,
      options?: { successMessage?: string; onSuccess?: () => Promise<void> },
    ) => {
      setSaving(true);
      try {
        await apiRequest(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success(options?.successMessage ?? "Saved successfully.");
        await options?.onSuccess?.();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { saving, saveSettings };
}

export function useSettingsLoading() {
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      return await apiRequest<AppSettings>("/settings");
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, loadSettings };
}
