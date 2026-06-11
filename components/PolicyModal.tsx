"use client";

import { getPolicyContent, getPolicyTitle, PolicyModalProps } from "@/types/policy";

function hasHtml(value: string) {
    return /<\/?[a-z][\s\S]*>/i.test(value);
}

function textBlocks(value: string) {
    return value
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean);
}

export default function PolicyModal({
    isOpen,
    onClose,
    policyId,
    policyTitle,
    policies,
    isLoading = false,
}: PolicyModalProps) {

    if (!isOpen) return null;

    const title = getPolicyTitle(policies, policyId) || policyTitle;
    const content = getPolicyContent(policies, policyId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-lg bg-white p-8 shadow-2xl max-h-[80vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-3xl leading-none text-neutral-400 transition hover:text-neutral-900"
                    aria-label="Close policy modal"
                    type="button"
                >
                    &times;
                </button>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-pulse text-neutral-500">Loading...</div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">
                            {title}
                        </h2>

                        {content && hasHtml(content) ? (
                            <div
                                className="prose prose-sm max-w-none text-neutral-600 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        ) : content ? (
                            <div className="space-y-4 text-sm leading-7 text-neutral-600">
                                {textBlocks(content).map((block, index) => (
                                    <p className="whitespace-pre-line" key={`${index}-${block.slice(0, 24)}`}>
                                        {block}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-500">No content available for this policy.</p>
                        )}

                        <div className="mt-8">
                            <button
                                onClick={onClose}
                                className="bg-neutral-900 text-white px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-neutral-700 transition"
                                type="button"
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
