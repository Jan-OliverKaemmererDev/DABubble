/**
 * @file Typed shape of the Firestore user document at users/{uid}.
 */
import { FieldValue, Timestamp } from '@angular/fire/firestore';

/**
 * Firestore document stored at users/{uid}. On write, createdAt holds the
 * serverTimestamp() sentinel; on read it resolves to a Timestamp.
 */
export interface UserDoc {
  uid: string;
  name: string;
  email: string;
  avatarPath: string;
  createdAt: Timestamp | FieldValue;
}
