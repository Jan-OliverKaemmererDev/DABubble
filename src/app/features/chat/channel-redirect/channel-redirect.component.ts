/**
 * @file Default /app child: redirects to the user's first channel.
 */
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ChannelService } from '../../../services/channel.service';

/**
 * Rendered at /app while no channel is selected. As soon as the channel
 * stream has loaded, it redirects to the alphabetically first channel;
 * users without channels stay on the empty chat card.
 */
@Component({
  selector: 'app-channel-redirect',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelRedirectComponent {
  private readonly channelService = inject(ChannelService);

  private readonly router = inject(Router);


  /**
   * Watches the channel stream and performs the one-time redirect.
   */
  constructor() {
    effect(() => this.redirectToFirstChannel());
  }


  /**
   * Navigates to the alphabetically first channel once channels are loaded.
   */
  private redirectToFirstChannel(): void {
    if (!this.channelService.channelsLoaded()) return;
    const first = [...this.channelService.channels()].sort((a, b) =>
      a.name.localeCompare(b.name, 'de'),
    )[0];
    if (!first) return;
    this.router.navigate(['/app/channel', first.id], { replaceUrl: true });
  }
}
