/**
 * @file Typed shapes of message and reply documents in the Firestore
 * subcollections .../messages/{messageId} and .../replies/{replyId}.
 */
import { FieldValue, Timestamp } from '@angular/fire/firestore';

/**
 * Emoji reactions on a message: emoji character mapped to the uids of the
 * users who reacted with it.
 */
export type ReactionMap = Record<string, string[]>;

/**
 * Firestore document stored at channels/{channelId}/messages/{messageId} or
 * directMessages/{conversationId}/messages/{messageId}. Thread replies live
 * in the replies subcollection; replyCount and lastReplyAt are denormalized
 * here so thread previews need no reply reads.
 */
export interface MessageDoc {
  /** Uid of the message author. */
  authorId: string;
  /** Message text content. */
  text: string;
  /** Creation time; serverTimestamp() sentinel on write, Timestamp on read. */
  createdAt: Timestamp | FieldValue;
  /** Emoji reactions keyed by emoji character. */
  reactions: ReactionMap;
  /** Denormalized number of replies in the replies subcollection. */
  replyCount: number;
  /** Denormalized time of the latest reply; null while no replies exist. */
  lastReplyAt: Timestamp | FieldValue | null;
}

/**
 * Firestore document stored at .../messages/{messageId}/replies/{replyId}.
 */
export interface ReplyDoc {
  /** Uid of the reply author. */
  authorId: string;
  /** Reply text content. */
  text: string;
  /** Creation time; serverTimestamp() sentinel on write, Timestamp on read. */
  createdAt: Timestamp | FieldValue;
  /** Emoji reactions keyed by emoji character. */
  reactions: ReactionMap;
}
