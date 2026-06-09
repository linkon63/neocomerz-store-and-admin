"use client";
import { contactFormValidation } from '@/utils/validation';
import { useState } from 'react';
import { ContactFormData, FormErrors } from '@/types/formData';

export default function ContactForm() {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        message: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatusMessage(null);
        const validationResult = contactFormValidation(formData);

        if (validationResult.isValid) {
            setErrors({});
            setIsSubmitting(true);
            try {
                const response = await fetch('/api/resend/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();
                if (data.success) {

                    setFormData({ name: '', email: '', message: '' });
                    setStatusMessage({
                        text: "Message sent successfully! We will get back to you soon.",
                        type: 'success'
                    });
                } else {
                    console.error('Failed to send message');
                }
            } catch (error) {
                setStatusMessage({ text: "Something went wrong. Please try again.", type: 'error' });
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setErrors(validationResult.errors);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <input
                        type="text"
                        placeholder="Name *"
                        className="w-full p-4 border-b-2 border-gray-200 focus:border-black outline-none transition"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <input
                        type="email"
                        placeholder="Email *"
                        className="w-full p-4 border-b-2 border-gray-200 focus:border-black outline-none transition"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
            </div>

            <div>
                <textarea
                    rows={4}
                    placeholder="Message"
                    className="w-full p-4 border-b-2 border-gray-200 focus:border-black outline-none transition"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>

            {statusMessage && (
                <div className={`p-4 mt-4 rounded ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {statusMessage.text}
                </div>
            )}

            <button
                disabled={isSubmitting}
                className={`${isSubmitting ? 'bg-gray-500' : 'bg-black'} text-white px-10 py-3 mt-4 transition`}
            >
                {isSubmitting ? 'Sending...' : 'Send'}
            </button>
        </form>
    );
}