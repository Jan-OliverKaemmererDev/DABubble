/**
 * @file Shared state of the currently open message thread.
 */
import { Injectable, computed, signal } from '@angular/core';

/** Identifies the thread shown in the panel. */
export interface ThreadContext {
  /** Firestore path of the thread's origin message document. */
  readonly messagePath: string;
  /** Context reference shown in the panel header, e.g. "# Entwicklerteam". */
  readonly contextLabel: string;
}

/**
 * Signal-based state for the thread panel in the app shell. Chat views open
 * threads from their messages; the shell renders the panel while a context
 * is set and closes it via the panel's close button or on context switches.
 */
@Injectable({ providedIn: 'root' })
export class ThreadService {
  private readonly context = signal<ThreadContext | null>(null);

  readonly thread = this.context.asReadonly();

  readonly isOpen = computed(() => this.context() !== null);


  /**
   * Opens the panel for the given thread.
   * @param context Origin message path and header label.
   */
  open(context: ThreadContext): void {
    this.context.set(context);
  }


  /**
   * Closes the panel.
   */
  close(): void {
    this.context.set(null);
  }
}
