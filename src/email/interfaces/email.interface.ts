export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  content: string; // Base64 encoded content
  name: string;
}

export interface SendEmailOptions {
  to: EmailRecipient[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  replyTo?: EmailRecipient;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export interface SendTemplateEmailOptions {
  to: EmailRecipient[];
  templateId: number;
  params?: Record<string, any>;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  replyTo?: EmailRecipient;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
}

export interface EmailResponse {
  messageId: string;
  success: boolean;
  error?: string;
}
