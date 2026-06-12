/**
 * @file Channel chat view: header, live message list and composer.
 */
import { formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  LOCALE_ID,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Timestamp } from '@angular/fire/firestore';
import { switchMap } from 'rxjs';

import { Channel } from '../../../models/channel.model';
import { Message } from '../../../models/message.model';
import { UserDoc } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { ChannelService } from '../../../services/channel.service';
import { MessageService } from '../../../services/message.service';
import { DEFAULT_AVATAR_PATH } from '../../../services/registration.service';
import { ToastService } from '../../../services/toast.service';
import { UserService } from '../../../services/user.service';
import { MessageInputComponent } from '../message-input/message-input.component';

const TODAY_LABEL = 'Heute';
const DATE_KEY_FORMAT = 'yyyy-MM-dd';
const DAY_LABEL_FORMAT = 'EEEE, d MMMM';
const TIME_FORMAT = 'HH:mm';
const UNKNOWN_AUTHOR = 'Unbekannt';
const SEND_ERROR = 'Die Nachricht konnte nicht gesendet werden.';
const NEAR_BOTTOM_THRESHOLD_PX = 120;
const HEAD_AVATAR_LIMIT = 3;

/** Consecutive messages of one calendar day under a shared separator. */
interface MessageGroup {
  readonly key: string;
  readonly label: string;
  readonly messages: Message[];
}

/**
 * Chat view of a channel per Figma frames 06/09: header with name and
 * member cluster, live message list with German date separators and thread
 * previews, and the composer. Auto-scrolls to new messages unless the user
 * scrolled up to read history; focuses the composer on channel switches.
 */
@Component({
  selector: 'app-channel-view',
  imports: [MessageInputComponent],
  templateUrl: './channel-view.component.html',
  styleUrl: './channel-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelViewComponent {
  readonly channelId = input.required<string>();

  private readonly channelService = inject(ChannelService);

  private readonly messageService = inject(MessageService);

  private readonly userService = inject(UserService);

  private readonly authService = inject(AuthService);

  private readonly toastService = inject(ToastService);

  private readonly locale = inject(LOCALE_ID);

  private readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  private readonly composer = viewChild(MessageInputComponent);

  private stickToBottom = true;

  private renderedChannelId: string | null = null;

  private readonly messages = toSignal(
    toObservable(this.channelId).pipe(switchMap(id => this.messageService.streamMessages(id))),
    { initialValue: [] as Message[] },
  );

  protected readonly channel = computed<Channel | undefined>(() =>
    this.channelService.channels().find(channel => channel.id === this.channelId()),
  );

  protected readonly groups = computed(() => this.groupMessages());

  protected readonly headMembers = computed(() => this.resolveHeadMembers());

  protected readonly memberCount = computed(() => this.channel()?.memberIds.length ?? 0);

  protected readonly composerPlaceholder = computed(
    () => `Nachricht an #${this.channel()?.name ?? ''}`,
  );

  private readonly usersById = computed(
    () => new Map(this.userService.users().map(user => [user.uid, user])),
  );


  /**
   * Reacts to channel switches (focus + scroll reset) and to message
   * changes (conditional auto-scroll).
   */
  constructor() {
    effect(() => this.handleChannelSwitch(this.channelId()));
    effect(() => this.handleMessagesRendered(this.groups()));
  }


  /**
   * Sends a composer message; failures surface as a toast.
   * @param text Trimmed message text from the composer.
   */
  protected async sendMessage(text: string): Promise<void> {
    try {
      await this.messageService.sendMessage(this.channelId(), text);
    } catch {
      this.toastService.show(SEND_ERROR);
    }
  }


  /**
   * Tracks whether the user is near the bottom; only then new messages may
   * auto-scroll the list.
   */
  protected onScroll(): void {
    const element = this.scrollContainer()?.nativeElement;
    if (!element) return;
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
    this.stickToBottom = distance < NEAR_BOTTOM_THRESHOLD_PX;
  }


  /**
   * Reports whether the message was written by the signed-in user.
   * @param message Message from the live stream.
   */
  protected isOwn(message: Message): boolean {
    return message.authorId === this.authService.currentUser()?.uid;
  }


  /**
   * Resolves the author's display name live via the user stream.
   * @param message Message from the live stream.
   */
  protected authorName(message: Message): string {
    return this.usersById().get(message.authorId)?.name ?? UNKNOWN_AUTHOR;
  }


  /**
   * Resolves the author's avatar with the placeholder as fallback.
   * @param message Message from the live stream.
   */
  protected authorAvatar(message: Message): string {
    return this.avatarSrc(this.usersById().get(message.authorId)?.avatarPath);
  }


  /**
   * Maps an avatar path to an absolute asset URL; missing paths and
   * external URLs fall back to the placeholder.
   * @param path Avatar path stored on a user document.
   */
  protected avatarSrc(path: string | undefined): string {
    if (!path || path.startsWith('http')) return `/${DEFAULT_AVATAR_PATH}`;
    return `/${path}`;
  }


  /**
   * Formats a message's creation time as HH:mm.
   * @param message Message from the live stream.
   */
  protected messageTime(message: Message): string {
    return formatDate(resolveDate(message.createdAt), TIME_FORMAT, this.locale);
  }


  /**
   * Formats the latest reply time as HH:mm; empty without replies.
   * @param message Message from the live stream.
   */
  protected lastReplyTime(message: Message): string {
    if (!message.lastReplyAt) return '';
    return formatDate(resolveDate(message.lastReplyAt), TIME_FORMAT, this.locale);
  }


  /**
   * Builds the singular/plural reply-count label for the thread preview.
   * @param message Message from the live stream.
   */
  protected replyLabel(message: Message): string {
    return message.replyCount === 1 ? '1 Antwort' : `${message.replyCount} Antworten`;
  }


  /**
   * Resets scroll stickiness and focuses the composer on channel switches.
   * @param channelId Currently routed channel id.
   */
  private handleChannelSwitch(channelId: string): void {
    if (channelId === this.renderedChannelId) return;
    this.renderedChannelId = channelId;
    this.stickToBottom = true;
    requestAnimationFrame(() => this.composer()?.focusInput());
  }


  /**
   * Scrolls to the newest message after rendering while the user is near
   * the bottom; reading history is never interrupted.
   * @param groups Rendered message groups (effect dependency).
   */
  private handleMessagesRendered(groups: MessageGroup[]): void {
    if (groups.length === 0 || !this.stickToBottom) return;
    requestAnimationFrame(() => {
      const element = this.scrollContainer()?.nativeElement;
      if (element) element.scrollTop = element.scrollHeight;
    });
  }


  /**
   * Groups the ordered messages by calendar day for the date separators.
   */
  private groupMessages(): MessageGroup[] {
    const groups: MessageGroup[] = [];
    for (const message of this.messages()) {
      const date = resolveDate(message.createdAt);
      const key = formatDate(date, DATE_KEY_FORMAT, this.locale);
      const current = groups[groups.length - 1];
      if (current?.key === key) current.messages.push(message);
      else groups.push({ key, label: this.dayLabel(date), messages: [message] });
    }
    return groups;
  }


  /**
   * Builds the separator label: "Heute" for today, otherwise the German
   * long form like "Dienstag, 14 Januar".
   * @param date Calendar day of the group.
   */
  private dayLabel(date: Date): string {
    const dayKey = formatDate(date, DATE_KEY_FORMAT, this.locale);
    const todayKey = formatDate(new Date(), DATE_KEY_FORMAT, this.locale);
    return dayKey === todayKey ? TODAY_LABEL : formatDate(date, DAY_LABEL_FORMAT, this.locale);
  }


  /**
   * Resolves up to three member documents for the header avatar cluster.
   */
  private resolveHeadMembers(): UserDoc[] {
    const memberIds = this.channel()?.memberIds ?? [];
    return memberIds
      .map(uid => this.usersById().get(uid))
      .filter((user): user is UserDoc => user !== undefined)
      .slice(0, HEAD_AVATAR_LIMIT);
  }
}


/**
 * Converts a Firestore timestamp to a Date; pending serverTimestamp()
 * sentinels (just-sent messages) resolve to now.
 * @param value Timestamp field value from a message document.
 */
function resolveDate(value: Message['createdAt']): Date {
  return value instanceof Timestamp ? value.toDate() : new Date();
}
