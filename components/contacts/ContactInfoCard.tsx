"use client"

import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ContactInfoCard() {
    const { t } = useI18n();

    return (
        <div>
            <div className="space-y-12">
                <div>
                    <h2 className="text-2xl font-bold mb-6">Humana People to People Italy</h2>
                    <div className="space-y-6 text-gray-700">
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">📍</span>
                            <div>
                                <p className="font-bold">{t("contact.info.addressLabel")}</p>
                                <p>Via Bergamo 9 B/C, 20006 Pregnana Milanese (MI)</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">📞</span>
                            <div>
                                <p className="font-bold">{t("contact.info.phoneLabel")}</p>
                                <p>(+39) 02 93964052</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">✉️</span>
                            <div>
                                <p className="font-bold">{t("contact.info.emailLabel")}</p>
                                <p>vintageonline@humanaitalia.org</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
