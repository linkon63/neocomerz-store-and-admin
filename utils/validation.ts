import { emailRegex } from "@/utils/regex";

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
