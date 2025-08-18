import { Injectable } from '@nestjs/common';
import { db } from './firebase'

export interface Health {
  status: string,
  ts: Date
}

export interface HealthStatus extends Health {
  service: string,
}

export interface DbHealtStatus extends Health {
  usingEmulator: boolean,
  data: object | null,
}

@Injectable()
export class AppService {
  getHealth(): HealthStatus {
    return { status: 'OK', service: 'backend', ts: new Date() };
    }
}

@Injectable()
export class DbHealth {
  async getDbHealth(): Promise<DbHealtStatus> {
    const ref = db.collection('health').doc('ping');

    await ref.set({ user: 'Ally', writeAt: new Date() });

    return {
      status: 'OK',
      usingEmulator: !!process.env.FIRESTORE_EMULATOR_HOST,
      data: (await ref.get()).data() || null,
      ts: new Date(),
    }
  }
}

