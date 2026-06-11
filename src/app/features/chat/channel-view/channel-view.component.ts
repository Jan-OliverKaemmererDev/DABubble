/**
 * @file Placeholder for the channel chat view (implemented in module 3).
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Placeholder rendered at /app/channel/:channelId until the channel chat
 * view is implemented in module 3.
 */
@Component({
  selector: 'app-channel-view',
  template: `
    <div>
      <h2>Channel View</h2>
      <p class="text-muted">Placeholder — implementation pending.</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelViewComponent {}
