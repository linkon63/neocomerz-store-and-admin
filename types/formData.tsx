export interface ContactFormData{
    email:string,
    name:string,
    message:string,
}

export interface FormErrors {
    name?: string;
    email?: string;
    message?: string;
};

export interface EmailTemplateProps {
  name?: string;
  email: string;
  message?: string;
}
