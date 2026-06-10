"use client";
import { useState } from 'react';
import { toast } from 'sonner';
import { newsletterEmailValidation } from '@/utils/validation';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [accepted, setAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = newsletterEmailValidation(email, accepted);
        if (!validation.isValid) {
            const errorMsg = validation.errors.email || validation.errors.accepted || "Invalid input";
            toast.error(errorMsg);
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/resend/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Thanks for subscribing!");
                setEmail('');
                setAccepted(false);
            } else {
                throw new Error(data.message || "Something went wrong");
            }
        } catch (error) {
            toast.error("Failed to subscribe. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-[#ffd02f] py-16 mb-16 md:mb-20 lg:mb-24">
            <div className="mx-auto container grid gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
                <div>
                    <h2 className="font-bembo text-3xl font-bold leading-tight text-black sm:text-5xl">
                        Subscribe to our newsletter
                    </h2>
                    <p className="mt-4 text-sm font-medium text-black sm:text-base">
                        Stay updated and receive 10% off your first order.
                    </p>
                </div>
                <div>
                    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2" noValidate>
                        <div className="flex w-full">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="min-w-0 flex-1 bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-500"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#120b16] px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white disabled:opacity-70 transition-opacity"
                            >
                                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </div>

                        <label className="mt-2 flex items-center gap-3 text-sm font-bold text-black cursor-pointer">
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                className="h-4 w-4 rounded border border-neutral-400 bg-white"
                            />
                            <span>I have read and accept the terms and conditions</span>
                        </label>
                    </form>
                </div>
            </div>
        </section>
    );
}