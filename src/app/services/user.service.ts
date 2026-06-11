/**
 * @file User data service. Backend integration pending.
 */
import { Injectable, signal } from '@angular/core';

import { UserDoc } from '../models/user.model';

/**
 * Manages user profile data from the users collection.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  readonly users = signal<UserDoc[]>([]);


  /** Placeholder — will fetch user by ID from database. */
  getUserById(_uid: string): UserDoc | undefined {
    return undefined;
  }


  /** Placeholder — will persist profile updates to database. */
  updateProfile(_uid: string, _changes: Partial<UserDoc>): Promise<void> {
    return Promise.resolve();
  }
}
