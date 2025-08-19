import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common'
import { Observable, from, defer, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { db } from '../firebase'
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, PutUserDto } from './dto/update-user.dto';
import { PublicUser } from './types/user.model';

@Injectable()
export class UsersService {
    // POST: returns created user
    create(body: CreateUserDto): Observable<PublicUser> {
        return defer(async () => {
            // Check if email already exists
            const existingUserQuery = await db.collection('users').where('email', '==', body.email).get();
            if (!existingUserQuery.empty) {
                throw new ConflictException('A user with this email already exists');
            }

            const docRef= db.collection('users').doc(); // auto id
            const payload = {
                name: body.name,
                email: body.email,
                role: body.role ?? 'user'
            };
            await docRef.set(payload);
            return { id: docRef.id, ...payload } as PublicUser;
        }).pipe(
            catchError((err) => {
                if (err instanceof ConflictException) return throwError(() => err);
                return throwError(() => new InternalServerErrorException('Failed to create user'));
            }),
        );
    }

    // GET: returns all users 
    findAll(): Observable<PublicUser[]> {
        return from(db.collection('users').get()).pipe(
            map((snapshot) =>
                snapshot.docs.map((doc) => {
                    const data = doc.data() as any;
                    return {
                        id: doc.id,
                        name: data.name,
                        email: data.email,
                        role: data.role ?? 'user',
                    } as PublicUser;
                }),
            ),
            catchError((err) =>
                throwError(() => new InternalServerErrorException('Failed to list users')),
            ),
        );
    }

    // Get: return specific user; 404 if not found
    findOne(id: string): Observable<PublicUser> {
        return from(db.collection('users').doc(id).get()).pipe(
            map((snap) => {
                if(!snap.exists) {
                    throw new NotFoundException('User not found');
                }
                const data = snap.data() as any;
                return {
                    id: snap.id,
                    name: data.name,
                    email: data.email,
                    role: data.role ?? 'user', 
                } as PublicUser;
            }),
            catchError((err) => {
                if (err instanceof NotFoundException) return throwError(() => err);
                return throwError(() => new InternalServerErrorException('Failed to get user'));
            }),
        );
    }

    // PATCH: partial update; returns updated user
    updatePatch(id: string, partial: UpdateUserDto): Observable<PublicUser> {
        return defer(async () => {
            const docRef = db.collection('users').doc(id);
            // Check if user exists first
            const existingSnap = await docRef.get();
            if (!existingSnap.exists) {
                throw new NotFoundException('User not found');
            }

            // If email is being updated, check for conflicts
            if (partial.email !== undefined) {
                const existingUserQuery = await db.collection('users')
                    .where('email', '==', partial.email)
                    .get();
                
                // Check if another user (not this one) already has this email
                const conflictingUser = existingUserQuery.docs.find(doc => doc.id !== id);
                if (conflictingUser) {
                    throw new ConflictException('A user with this email already exists');
                }
            }

            // Filter undefined values before updating
            const updateData: any = {};
            if (partial.name !== undefined) updateData.name = partial.name;
            if (partial.email !== undefined) updateData.email = partial.email;
            if (partial.role !== undefined) updateData.role = partial.role;
            
            // Only update if there's something to update
            if (Object.keys(updateData).length > 0) {
                await docRef.update(updateData);
            }
            // Get updated data
            const snap = await docRef.get();
            const data = snap.data() as any;
            return {
                id: snap.id,
                name: data.name,
                email: data.email,
                role: data.role ?? 'user',
            } as PublicUser;
        }).pipe(
            catchError((err) => {
                if (err instanceof NotFoundException) return throwError(() => err);
                if (err instanceof ConflictException) return throwError(() => err);
                return throwError(() => new InternalServerErrorException('Failed to update user'));
            }),
        );
    }

    // PUT: full replace; returns updated user
    updatePut(id: string, full: PutUserDto): Observable<PublicUser> {
        return defer(async () => {
            const docRef = db.collection('users').doc(id);
            // Check if user exists first
            const existingSnap = await docRef.get();
            if (!existingSnap.exists) {
                throw new NotFoundException('User not found');
            }

            // Check for email conflicts
            const existingUserQuery = await db.collection('users')
                .where('email', '==', full.email)
                .get();
            
            // Check if another user (not this one) already has this email
            const conflictingUser = existingUserQuery.docs.find(doc => doc.id !== id);
            if (conflictingUser) {
                throw new ConflictException('A user with this email already exists');
            }

            // Convert to plain object for Firestore
            const updateData = {
                name: full.name,
                email: full.email,
                role: full.role
            };
            // Full replace
            await docRef.set(updateData);
            return { id, ...updateData } as PublicUser;
        }).pipe(
            catchError((err) => {
                if (err instanceof NotFoundException) return throwError(() => err);
                if (err instanceof ConflictException) return throwError(() => err);
                return throwError(() => new InternalServerErrorException('Failed to replace user'));
            }),
        );
    }

    // DELETE
    remove(id: string, hard = true): Observable< { success: true } > {
        return defer(async () => {
            // for now: hard delete immediately
            await db.collection('users').doc(id).delete();
            return { success: true as const };
        }).pipe(
            catchError(() => 
                throwError(() => new InternalServerErrorException('Failed to delete user')),
            ),
        );
    }

}