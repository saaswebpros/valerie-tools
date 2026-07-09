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
  name?: string;
  email?: string;
  phone?: string;
  service_type?: string;
}

export class SendSmsDto {
  phone?: string;
  name?: string;
  service_type?: string;
}
