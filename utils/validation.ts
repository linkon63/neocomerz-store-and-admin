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