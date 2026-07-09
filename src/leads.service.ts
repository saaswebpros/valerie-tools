import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CreateLeadDto } from './dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger('LeadsService');
  private readonly leadsFile = path.join(os.homedir(), 'valerie_leads.jsonl');

  createLead(dto: CreateLeadDto) {
    const record = {
      timestamp: new Date().toISOString(),
      name: dto.name || '',
      email: dto.email || '',
      phone: dto.phone || '',
      service_type: dto.service_type || '',
      project_details: dto.project_details || '',
      timeline: dto.timeline || '',
      budget: dto.budget || '',
      appointment_details: dto.appointment_details || '',
    };
    try {
      fs.appendFileSync(this.leadsFile, JSON.stringify(record) + '\n');
    } catch (e) {
      this.logger.error('Failed to persist lead: ' + (e as Error).message);
    }
    this.logger.log(`New lead captured: ${record.name} <${record.email}> ${record.phone}`);
    return {
      success: true,
      message: `Lead created for ${record.name || 'customer'}`,
      lead: record,
    };
  }
}
