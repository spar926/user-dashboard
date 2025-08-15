import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: string,
  service: string,
  ts: Date
}

@Injectable()
export class AppService {
  getHealth(): HealthStatus {
    return { status: 'OK', service: 'backend', ts: new Date() };
    }
}
