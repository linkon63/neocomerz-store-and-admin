"use client";

import { useState } from "react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    { question: "How do I track my order?", answer: "You will receive an email once your order ships with a tracking link." },
    { question: "What is the return policy?", answer: "You can return any item within 30 days of purchase." },
    { question: "Do you ship internationally?", answer: "Yes, we ship to over 50 countries worldwide." },
];

export default function FAQModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!isOpen) return null;

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-300 max-h-[80vh] overflow-y-auto">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-black text-3xl"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold mb-6 text-neutral-900">Frequently Asked Questions</h2>

                <div className="space-y-4">
                    {faqs.map((item, index) => (
                        <div key={index} className="border-b border-neutral-200 pb-2">
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="flex justify-between items-center w-full py-2 text-left font-semibold text-neutral-800 hover:text-black"
                            >
                                {item.question}
                                <span className="text-xl">{openIndex === index ? "−" : "+"}</span>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <p className="text-neutral-500 text-sm py-2">{item.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}