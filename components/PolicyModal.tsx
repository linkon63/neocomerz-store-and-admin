"use client";

import { PolicyData, PolicyModalProps } from "@/types/policy";
import { useEffect, useState } from "react";

export default function PolicyModal({ isOpen, onClose, policyId, policyTitle }: PolicyModalProps) {
    const [data, setData] = useState<PolicyData>();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && policyId) {
            setIsLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/policies`)
                .then((res) => res.json())
                .then((result) => {
                    setData(result);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching policies:", err);
                    setIsLoading(false);
                });
        }
    }, [isOpen, policyId]);

    if (!isOpen) return null;

    const currentPolicy = data?.[policyId];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-2xl max-h-[80vh] overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-pulse text-neutral-500">Loading...</div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">
                            {currentPolicy?.title || policyTitle}
                        </h2>

                        {currentPolicy?.content ? (
                            <div
                                className="prose prose-sm max-w-none text-neutral-600"
                                dangerouslySetInnerHTML={{ __html: currentPolicy.content }}
                            />
                        ) : (
                            <p className="text-sm text-neutral-500">No content available for this policy.</p>
                        )}

                        <div className="mt-8">
                            <button
                                onClick={onClose}
                                className="bg-neutral-900 text-white px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-neutral-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}