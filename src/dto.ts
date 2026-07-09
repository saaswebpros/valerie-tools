export class CreateLeadDto {
  name?: string;
  email?: string;
  phone?: string;
  service_type?: string;
  project_details?: string;
  timeline?: string;
  budget?: string;
  appointment_details?: string;
}

export class SendEmailDto {
  // Legacy / structured fields
  name?: string;
  email?: string;
  phone?: string;
  service_type?: string;

  // Fields sent by the ElevenLabs "send_confirmation_email" tool
  recipient_email?: string;
  subject?: string;
  message_body?: string;
  conversation_id?: string;
}

export class SendSmsDto {
  phone?: string;
  name?: string;
  service_type?: string;
}
