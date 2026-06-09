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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationResult = contactFormValidation(formData);

        if (Object.keys(validationResult.errors).length === 0) {
            console.log('Form Submitted successfully:', formData);
            setErrors({});
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

            <button
                type="submit"
                className="bg-black text-white px-10 py-3 mt-4 hover:bg-gray-800 transition"
            >
                Send
            </button>
        </form>
    );
}