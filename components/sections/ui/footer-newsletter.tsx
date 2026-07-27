"use client";

import { useState } from "react";
import { toast } from "sonner";
import { newsletterEmailValidation } from "@/utils/validation";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = newsletterEmailValidation(email, true);
    if (!validation.isValid) {
      const errorMsg = validation.errors.email || "Invalid input";
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/resend/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Thanks for subscribing!");
        setEmail("");
      } else {
        throw new Error(data.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full mx-auto bg-white p-2" noValidate>
      <input
        type="email"
        placeholder="Join Our Newsletter Now"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 bg-white px-3 md:px-6 py-2 md:py-3 font-['Gotham'] text-sm text-rich-black placeholder:text-rich-black outline-none border-r-brand-5 border-r transition-colors"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-white text-rich-black px-4 md:px-8 py-2 md:py-3 font-['Gotham'] text-sm md:text-base font-medium uppercase transition-colors whitespace-nowrap cursor-pointer disabled:opacity-75"
      >
        {isSubmitting ? "SUBSCRIBING..." : "SUBSCRIBE"}
      </button>
    </form>
  );
}
