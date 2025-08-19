import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { Observable, from, defer, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { db } from '../firebase';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, PutUserDto } from './dto/update-user.dto';
import { PublicUser } from './types/user.model';
// TO-DO: create generic handler that will catch any error caught by controllers (non-200 response)
// write to firebase the error and the details
// 2.
// when ui starts, connect to websocket through API
// whenever user is added to firestore, the api should send message to UI that new user is added and UI should add to screen
// have api emit an event either over websocket to itself or handled by another service which sends an email
// UI show email pending to user using timeout (practice real-time communication aspect)
/**
 * make UTs
 * e2e tests
 */
@Injectable()
export class UsersService {
  // POST: returns created user
  create(body: CreateUserDto): Observable<PublicUser> {
    return defer(async () => {
      const doc = await db
        .collection('users')
        .where('email', '==', body.email)
        .limit(1)
        .get();

      if (!doc.empty) throw new ConflictException('Email Exists');

      const docRef = db.collection('users').doc(); // auto id
      const payload = {
        name: body.name,
        email: body.email,
        role: body.role ?? 'user',
      };
      await docRef.set(payload);
      return { id: docRef.id, ...payload } as PublicUser;
    }).pipe(
      catchError((err) => {
        if (err instanceof ConflictException) return throwError(() => err);
        return throwError(
          () => new InternalServerErrorException('Failed to create user'),
        );
      }),
    );
  }

  // GET: returns all users
  // if user is not a user, skip and log error message
  findAll(): Observable<PublicUser[]> {
    return defer(() => db.collection('users').get()).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            email: data.email,
            role: data.role ?? 'user',
          };
        }),
      ),
      catchError((err) =>
        throwError(
          () => new InternalServerErrorException('Failed to list users'),
        ),
      ),
    );
  }

  // Get: return specific user; 404 if not found
  findOne(id: string): Observable<PublicUser> {
    return defer(() => db.collection('users').doc(id).get()).pipe(
      map((snap) => {
        if (!snap.exists) {
          throw new NotFoundException('User not found');
        }
        const data = snap.data() as any;
        return {
          id: snap.id,
          name: data.name,
          email: data.email,
          role: data.role ?? 'user',
        };
      }),
      // take out return?
    //   catchError((err) => {
    //     if (err instanceof NotFoundException) return throwError(() => err);
    //     throwError(
    //       () => new InternalServerErrorException('Failed to get user'),
    //     );
    //   }),
    );
  }

  // PATCH: partial update, returns updated user
  updatePatch(id: string, partial: UpdateUserDto): Observable<PublicUser> {
    return defer(async () => {
      const docRef = db.collection('users').doc(id);
      const doc = await docRef.get();

      // check if user exists first
      if (!doc.exists) {
        throw new NotFoundException('User not found');
      }

      // filter undefined values before updating
      const updateData: any = {};
      if (partial.name !== undefined) updateData.name = partial.name;
      if (partial.email !== undefined) updateData.email = partial.email;
      if (partial.role !== undefined) updateData.role = partial.role;

      // update fails if object is empty
      if (Object.keys(updateData).length > 0) {
        await docRef.update(updateData);
      }

      // get updated data
      const snap = await docRef.get();
      const data = snap.data() as any;
      return {
        id: snap.id,
        name: data.name,
        email: data.email,
        role: data.role ?? 'user',
      };
    }).pipe(
      catchError((err) => {
        if (err instanceof NotFoundException) return throwError(() => err);
        if (err instanceof ConflictException) return throwError(() => err);
        return throwError(
          () => new InternalServerErrorException('Failed to update user'),
        );
      }),
    );
  }

  // PUT: full replace; returns updated user
  updatePut(id: string, full: PutUserDto): Observable<PublicUser> {
    return defer(async () => {
      const docRef = db.collection('users').doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException('User not found');
      }

      // convert to plain object for Firestore
      const updateData = {
        name: full.name,
        email: full.email,
        role: full.role,
      };
      // full replace
      await docRef.set(updateData);
      return { id, ...updateData } as PublicUser;
    }).pipe(
      catchError((err) => {
        if (err instanceof NotFoundException) return throwError(() => err);
        if (err instanceof ConflictException) return throwError(() => err);
        return throwError(
          () => new InternalServerErrorException('Failed to replace user'),
        );
      }),
    );
  }

  // DELETE
  remove(id: string, hard = true): Observable<{ success: true }> {
    return defer(async () => {
      const docRef = db.collection('users').doc(id);
      const doc = await docRef.get();

      if (!doc.exists) throw new NotFoundException();

      await docRef.delete();
      return { success: true as const };
    }).pipe(
      catchError((err) => {
        if (err instanceof NotFoundException) return throwError(() => err);
        return throwError(
          () => new InternalServerErrorException('Failed to delete user'),
        );
      }),
    );
  }
}

// typeGuard? user firestore converter
// function isUser(object: unknown): object is PublicUser {
//     // return a boolean
//     return
// }