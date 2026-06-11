/**
 * @file Main app shell: topbar, workspace column, chat area and thread panel.
 */
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TopbarComponent } from '../topbar/topbar.component';
import { WorkspaceMenuComponent } from '../workspace-menu/workspace-menu.component';

const OPEN_MENU_LABEL = 'Workspace-Menü öffnen';
const CLOSE_MENU_LABEL = 'Workspace-Menü schließen';

/**
 * Three-panel chat layout per the Figma frames 06/07. The workspace column
 * is collapsible via the vertical edge tab; the thread panel stays closed
 * behind a signal until module 5 takes over. The chat area hosts the router
 * outlet for the upcoming chat views.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TopbarComponent, WorkspaceMenuComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  protected readonly workspaceOpen = signal(true);

  protected readonly threadOpen = signal(false);

  protected readonly toggleLabel = computed(() =>
    this.workspaceOpen() ? CLOSE_MENU_LABEL : OPEN_MENU_LABEL,
  );

  protected readonly toggleIcon = computed(() =>
    this.workspaceOpen() ? '/icons/group-left.svg' : '/icons/group-right.svg',
  );


  /**
   * Toggles the workspace column.
   */
  protected toggleWorkspace(): void {
    this.workspaceOpen.update(open => !open);
  }
}
