/**
 * @file Message composer card with growing textarea and send handling.
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

const MAX_TEXTAREA_HEIGHT_PX = 200;

/**
 * Presentational composer per the Figma chat frames: outlined card with a
 * growing textarea, inert emoji and mention buttons (modules 4/9) and a
 * send button. Enter sends, Shift+Enter inserts a newline; trimmed-empty
 * input is not sendable. After sending, the field clears and keeps focus.
 */
@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageInputComponent {
  readonly placeholder = input.required<string>();

  readonly send = output<string>();

  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');

  protected readonly text = signal('');

  protected readonly canSend = computed(() => this.text().trim().length > 0);


  /**
   * Focuses the textarea; called by the parent on channel switches.
   */
  focusInput(): void {
    this.textarea().nativeElement.focus();
  }


  /**
   * Syncs the signal with the textarea and grows it with its content.
   * @param event Input event of the textarea.
   */
  protected onInput(event: Event): void {
    const element = event.target as HTMLTextAreaElement;
    this.text.set(element.value);
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }


  /**
   * Sends on Enter; Shift+Enter falls through and inserts a newline.
   * @param event Keydown event of the Enter key.
   */
  protected onEnter(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.shiftKey) return;
    event.preventDefault();
    this.submit();
  }


  /**
   * Emits the trimmed text, clears the composer and keeps focus.
   */
  protected submit(): void {
    if (!this.canSend()) return;
    this.send.emit(this.text().trim());
    this.text.set('');
    this.textarea().nativeElement.style.height = 'auto';
    this.focusInput();
  }
}
