import { Injectable } from '@nestjs/common';
import { db } from './firebase';
import { Observable, catchError, defer, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface Health {
  status: string;
  ts: Date;
}

export interface HealthStatus extends Health {
  service: string;
}

export interface DbHealthStatus extends Health {
  usingEmulator: boolean;
  data: object | null;
  id: string;
  exists: boolean;
}

export interface UserHealthStatus extends Health {
  name: object | null;
}

@Injectable()
export class AppService {
  getHealth(): HealthStatus {
    return { status: 'OK', service: 'backend', ts: new Date() };
  }

  getHealthUser(name: string): Observable<UserHealthStatus> {
    return defer(() => {
      const ref = db.collection('health').doc(name);

      return from(ref.set({ name: name })).pipe(
        switchMap(() => from(ref.get())),
        map((snapshot) => {
          const data = snapshot.data() || {};
          return {
            status: 'OK',
            ts: new Date(),
            name: data.name || 'Unknown',
          };
        }),
      );
    });
  }

  getDbHealth(): Observable<DbHealthStatus> {
    return defer(async () => {
      const ref = db.collection('health').doc('ping');
      await ref.set({ user: 'Ally', writeAt: new Date() });
      const snapshot = await ref.get();

      return {
        status: 'OK',
        usingEmulator: !!process.env.FIRESTORE_EMULATOR_HOST,
        data: snapshot.data() || null,
        ts: new Date(),
        id: snapshot.id,
        exists: snapshot.exists,
      };
    }).pipe(
      catchError((error) => {
        console.error('Error in getDbHealth:', error);
        throw new Error('Failed to fetch database health');
      }),
    );
  }
}
