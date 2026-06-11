/**
 * @file App topbar with brand, static search field, the signed-in user and
 * an interim profile menu for signing out.
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { DEFAULT_AVATAR_PATH } from '../../../services/registration.service';

const GUEST_NAME = 'Gast';

/**
 * Top bar of the app shell. Shows the brand, a static search input (search
 * logic follows in a later module) and the current user's identity. The
 * profile area opens a minimal interim dropdown with a logout entry.
 * TODO: replaced by the full profile menu module.
 */
@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  private readonly profileTrigger = viewChild<ElementRef<HTMLButtonElement>>('profileTrigger');

  protected readonly menuOpen = signal(false);

  protected readonly userName = computed(
    () => this.authService.currentUser()?.displayName ?? GUEST_NAME,
  );

  protected readonly avatarSrc = computed(() => this.resolveAvatar());

  protected readonly avatarAlt = computed(() => `Avatar von ${this.userName()}`);


  /**
   * Toggles the interim profile menu.
   */
  protected toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }


  /**
   * Closes the menu and returns focus to the profile trigger.
   */
  protected closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.profileTrigger()?.nativeElement.focus();
  }


  /**
   * Signs out and returns to the login page.
   */
  protected async logout(): Promise<void> {
    this.menuOpen.set(false);
    await this.authService.logout();
    this.router.navigate(['/auth/login']);
  }


  /**
   * Resolves the avatar source; external URLs fall back to the placeholder
   * because the avatar system is local-path based.
   */
  private resolveAvatar(): string {
    const path = this.authService.currentUser()?.photoURL ?? DEFAULT_AVATAR_PATH;
    return path.startsWith('http') ? `/${DEFAULT_AVATAR_PATH}` : `/${path}`;
  }


  /**
   * Swaps the avatar to the placeholder when the image fails to load.
   * @param event Error event of the avatar image element.
   */
  protected useAvatarFallback(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (image.src.endsWith(DEFAULT_AVATAR_PATH)) return;
    image.src = `/${DEFAULT_AVATAR_PATH}`;
  }
}
