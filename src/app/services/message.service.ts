/**
 * @file Live message streams and message creation for channel chats.
 */
import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  orderBy,
  query,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable, catchError, of } from 'rxjs';

import { Message, MessageDoc } from '../models/message.model';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

const MESSAGES_LOAD_ERROR = 'Nachrichten konnten nicht geladen werden.';

/**
 * Streams the messages of a channel ordered by creation time and persists
 * new messages with the denormalized thread fields initialized.
 */
@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly firestore = inject(Firestore);

  private readonly authService = inject(AuthService);

  private readonly toastService = inject(ToastService);

  private readonly injector = inject(EnvironmentInjector);


  /**
   * Streams a channel's messages live, oldest first. Safe to call from
   * reactive callbacks — the query is created in the injection context.
   * @param channelId Firestore id of the channel.
   */
  streamMessages(channelId: string): Observable<Message[]> {
    return runInInjectionContext(this.injector, () => this.queryMessages(channelId));
  }


  /**
   * Persists a message authored by the signed-in user with empty reactions
   * and thread counters, matching the data-model defaults.
   * @param channelId Firestore id of the target channel.
   * @param text Trimmed message text.
   */
  async sendMessage(channelId: string, text: string): Promise<void> {
    const message: MessageDoc = {
      authorId: this.authService.requireUid(),
      text,
      createdAt: serverTimestamp(),
      reactions: {},
      replyCount: 0,
      lastReplyAt: null,
    };
    await runInInjectionContext(this.injector, () =>
      addDoc(collection(this.firestore, `channels/${channelId}/messages`), message),
    );
  }


  /**
   * Builds the live query; on Firestore errors a toast is shown and an
   * empty list keeps the UI functional.
   * @param channelId Firestore id of the channel.
   */
  private queryMessages(channelId: string): Observable<Message[]> {
    const messagesQuery = query(
      collection(this.firestore, `channels/${channelId}/messages`),
      orderBy('createdAt'),
    );
    return (collectionData(messagesQuery, { idField: 'id' }) as Observable<Message[]>).pipe(
      catchError(() => this.reportLoadError()),
    );
  }


  /**
   * Shows the load-error toast and recovers with an empty list.
   */
  private reportLoadError(): Observable<Message[]> {
    this.toastService.show(MESSAGES_LOAD_ERROR);
    return of([]);
  }
}
