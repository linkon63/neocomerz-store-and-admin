import { emailRegex } from "@/utils/regex";

export interface CorporateInquiryData {
    fullName: string;
    organisation: string;
    email: string;
    phoneNumber: string;
    purpose: string;
    preferredCollection: string;
    deliveryDate: string;
    quantity: string;
    requirements: string;
}

export interface CorporateInquiryErrors {
    fullName?: string;
    organisation?: string;
    email?: string;
    phoneNumber?: string;
    purpose?: string;
    deliveryDate?: string;
    quantity?: string;
    requirements?: string;
    [key: string]: string | undefined;
}

export const corporateInquiryValidation = (data: CorporateInquiryData) => {
    const errors: CorporateInquiryErrors = {};
    let isValid = true;

    if (!data.fullName.trim()) {
        errors.fullName = "Full name is required.";
        isValid = false;
    } else if (data.fullName.trim().length < 2) {
        errors.fullName = "Full name must be at least 2 characters.";
        isValid = false;
    } else if (data.fullName.trim().length > 50) {
        errors.fullName = "Full name must be at most 50 characters.";
        isValid = false;
    }

    if (data.organisation.trim() && data.organisation.trim().length > 100) {
        errors.organisation = "Organisation must be at most 100 characters.";
        isValid = false;
    }

    if (!data.email.trim()) {
        errors.email = "Email is required.";
        isValid = false;
    } else if (data.email.length < 5 || data.email.length > 50) {
        errors.email = "Email must be between 5 and 50 characters.";
        isValid = false;
    } else if (!emailRegex.test(data.email.trim())) {
        errors.email = "Please enter a valid email address.";
        isValid = false;
    }

    if (!data.phoneNumber.trim()) {
        errors.phoneNumber = "Phone number is required.";
        isValid = false;
    } else if (!/^\d{7,15}$/.test(data.phoneNumber.trim())) {
        errors.phoneNumber = "Please enter a valid phone number.";
        isValid = false;
    }

    if (!data.purpose) {
        errors.purpose = "Please select a purpose of inquiry.";
        isValid = false;
    }

    if (!data.deliveryDate) {
        errors.deliveryDate = "Required delivery date is required.";
        isValid = false;
    }

    if (!data.quantity.trim()) {
        errors.quantity = "Estimated quantity is required.";
        isValid = false;
    } else if (!/^\d+$/.test(data.quantity.trim())) {
        errors.quantity = "Estimated quantity must be a number.";
        isValid = false;
    } else if (parseInt(data.quantity, 10) <= 0) {
        errors.quantity = "Estimated quantity must be greater than 0.";
        isValid = false;
    } else if (data.quantity.trim().length > 6) {
        errors.quantity = "Estimated quantity must not exceed 999999.";
        isValid = false;
    }

    if (data.requirements.trim() && data.requirements.trim().length > 1000) {
        errors.requirements = "Additional requirements must be at most 1000 characters.";
        isValid = false;
    }

    return { isValid, errors };
};

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
