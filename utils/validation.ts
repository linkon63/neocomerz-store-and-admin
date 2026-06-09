import { ContactFormData } from "@/types/formData";
import { emailRegex } from "@/utils/regex";

export function contactFormValidation(contactData: ContactFormData) {
    const errors: { [key: string]: string } = {};
    if (!contactData.name || contactData.name.trim().length < 3) {
        errors.name = "Name must be at least 3 characters long.";
    }
    
    if (!contactData.email || !emailRegex.test(contactData.email)) {
        errors.email = "Please enter a valid email address.";
    }
    if (!contactData.message || contactData.message.trim().length < 10) {
        errors.message = "Message must be at least 10 characters long.";
    } else if (contactData.message.length > 500) {
        errors.message = "Message cannot exceed 500 characters.";
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
}

export const newsletterEmailValidation = (email: string, accepted: boolean) => {
    const errors: { email?: string; accepted?: string } = {};
    let isValid = true;

    if (!email) {
        errors.email = "Email is required.";
        isValid = false;
    } else if (email.length < 5 || email.length > 50) {
        errors.email = "Email must be between 5 and 50 characters.";
        isValid = false;
    } else if (!emailRegex.test(email)) {
        errors.email = "Please enter a valid email address.";
        isValid = false;
    }

    if (!accepted) {
        errors.accepted = "You must accept the terms and conditions.";
        isValid = false;
    }

    return { isValid, errors };
};