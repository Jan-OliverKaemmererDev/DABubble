/**
 * @file Placeholder for the new-message compose view (implemented in module 4).
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Placeholder rendered at /app/new-message until the compose view with
 * recipient search is implemented in module 4.
 */
@Component({
  selector: 'app-new-message',
  template: `
    <div>
      <h2>New Message</h2>
      <p class="text-muted">Placeholder — implementation pending.</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewMessageComponent {}
