/**
 * @file Placeholder for the direct-message view (implemented in module 4).
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Placeholder rendered at /app/direct/:userId until the direct-message
 * view is implemented in module 4.
 */
@Component({
  selector: 'app-direct-message-view',
  template: `
    <div>
      <h2>Direct Message</h2>
      <p class="text-muted">Placeholder — implementation pending.</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectMessageViewComponent {}
