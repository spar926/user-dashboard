import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Observable, from, defer, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { db } from '../firebase';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, PutUserDto } from './dto/update-user.dto';
import { PublicUser } from './types/user.model';
import { isUser } from './utils/user.typeguard';
import { logErrorToFirestore } from './utils/user.errorlog';
import { EmailService } from './services/email.service';
import { EventsGateway } from 'src/websocket/events.gateway';

// 1. create generic handler that will catch any error caught by controllers
// 2. when ui starts, connect to websocket through API
// whenever user is added to firestore, the api should send message to UI that new user is added and UI should add to screen
// have api emit an event either over websocket to itself or handled by another service which sends an email
// UI show email pending to user using timeout (practice real-time communication aspect)
/**
 * make UTs
 * e2e tests
 */
@Injectable()
export class UsersService {
  constructor(
    private eventsGateway: EventsGateway,
    private emailService: EmailService
  ) {}

  // POST: returns created user
  create(body: CreateUserDto): Observable<PublicUser> {
    console.log('=== POST REQUEST RECEIVED ===');
    return defer(async () => {
      // query the firestore to check if same email exists
      const doc = await db.collection('users')
        .where('email', '==', body.email)
        .limit(1)
        .get();

      if (!doc.empty) throw new ConflictException('Email already exists'); // 409

      const docRef = db.collection('users').doc(); // auto id
      const payload = {
        name: body.name,
        email: body.email,
        role: body.role ?? 'user',
      };
      await docRef.set(payload);
      const newUser = { id: docRef.id, ...payload };

      // emit real-time event for new user when gateway is restored
      this.eventsGateway.emitUserCreated(newUser);
      
      this.emailService.sendWelcomeEmail(newUser.email, newUser.name)
        .catch(error => console.error('Email service error', error));

      return newUser;
    }).pipe(
      catchError((err) => {
        logErrorToFirestore(err);
        if (err instanceof ConflictException) return throwError(() => err); // 409
        return throwError(() => new InternalServerErrorException('Failed to create user')); // 500
      })
    )
  }

  // GET: returns all users
  findAll(): Observable<PublicUser[]> {
    console.log('=== GET REQUEST RECEIVED (ALL) ===');
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
      catchError((err) => {
        logErrorToFirestore(err);
        return throwError(() => new InternalServerErrorException('Failed to get all users')); // 500
      })
    );
  }

  // Get: return specific user; 404 if not found
  findOne(id: string): Observable<PublicUser> {
    console.log('=== GET REQUEST RECEIVED ===');
    console.log('ID:', id);
    return defer(() => db.collection('users').doc(id).get()).pipe(
      map((snap) => {
        if (!snap.exists) {
          throw new NotFoundException('User not found!'); // 404
        }
        const data = snap.data() 
        console.log('Fetched data:', data);

        if (!data || !isUser(data)) {
          console.log('Invalid user data:', data);
          throw new BadRequestException('Invalid user data'); // 400
        }
        return {
          id: snap.id,
          name: data.name,
          email: data.email,
          role: data.role ?? 'user',
        };
      }),
      catchError((err) => {
        logErrorToFirestore(err);
        if (err instanceof NotFoundException) return throwError(() => err); // 404
        if (err instanceof BadRequestException) return throwError(() => err); // 400
        return throwError(() => new InternalServerErrorException('Failed to get the user')); // 500
      })
    );
  }

  // PATCH: partial update, returns updated user
  updatePatch(id: string, partial: UpdateUserDto): Observable<PublicUser> {
    console.log('=== PATCH REQUEST RECEIVED ===');
    console.log('ID: ', id);
    return defer(async () => {
      if(id === ""){
        throw new BadRequestException('ID left empty'); // 400
      }
      
      const docRef = db.collection('users').doc(id);
      const doc = await docRef.get();

      // check if user exists first
      if (!doc.exists) {
        console.log('=== USER NOT FOUND - THROWING EXCEPTION ===');
        throw new NotFoundException('User not found!'); // 404
      }

      // filter undefined values before updating
      const updateData: any = {};
      if (partial.name !== undefined) updateData.name = partial.name;
      if (partial.email !== undefined) updateData.email = partial.email;
      if (partial.role !== undefined) updateData.role = partial.role;

      // update fails if object is empty
      if (Object.keys(updateData).length > 0) {
        await docRef.update(updateData);
      } else {
        throw new BadRequestException('Update data cannot be empty'); // 400
      };

      // get updated data
      const snap = await docRef.get();

      const data = snap.data();
      console.log('Fetched data', data);

      if (!data || !isUser(data)) {
        console.log('Invalid user data:', data);
        throw new BadRequestException('Invalid user data'); // 400
      }

      return {
        id: snap.id,
        name: data.name,
        email: data.email,
        role: data.role ?? 'user',
      };
    }).pipe(
      catchError((err) => {
        logErrorToFirestore(err);
        if (err instanceof BadRequestException) return throwError(() => err); // 400
        if (err instanceof NotFoundException) return throwError(() => err); // 404
        return throwError(() => new InternalServerErrorException('Failed to update user information')); // 500
      })
    )
  }

  // PUT: full replace; returns updated user
  updatePut(id: string, full: PutUserDto): Observable<PublicUser> {
    console.log('=== PUT REQUEST RECEIVED ===');
    console.log('ID: ', id);
    return defer(async () => {
      const docRef = db.collection('users').doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException('User not found!'); // 404
      }

      // convert to object for Firestore
      const updateData = {
        name: full.name,
        email: full.email,
        role: full.role,
      };

      // full replace
      await docRef.set(updateData);
      return { id, ...updateData };
    }).pipe(
      catchError((err) => {
        logErrorToFirestore(err);
        if(err instanceof NotFoundException) return throwError(() => err); // 404
        return throwError(()=> new InternalServerErrorException('Failed to update user information')); // 500
      })
    )
  }

  // DELETE
  remove(id: string): Observable<{ success: true }> {
    console.log('=== DELETE REQUEST RECEIVED ===');
    console.log('ID: ', id);
    return defer(async () => {
      const docRef = db.collection('users').doc(id);
      const doc = await docRef.get();

      if (!doc.exists) throw new NotFoundException('User not found!'); // 404

      await docRef.delete();
      return { success: true as const }; // make sure success is always true
    }).pipe(
      catchError((err) => {
        logErrorToFirestore(err);
        if (err instanceof NotFoundException) return throwError(() => err); // 404
        return throwError(() => new InternalServerErrorException('Failed to delete user')); // 500
      })
    )
  }
}
