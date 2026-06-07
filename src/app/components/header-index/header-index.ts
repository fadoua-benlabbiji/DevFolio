import { Component, HostListener, OnInit, Input, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../user';

@Component({
  selector: 'app-header-index',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header-index.html',
  styleUrl: './header-index.css',
})
export class HeaderIndex implements OnInit {
  private userService = inject(UserService);
  private router      = inject(Router);

  @Input() forceLoggedIn: boolean | null = null;

  isScrolled    = false;
  menuOpen      = false;
  activeSection = 'hero';

  private isManualScroll    = false;
  private manualScrollTimer: any = null;

  get currentUser() { return this.userService.currentUser(); }

  isLoggedIn(): boolean {
    const onExplorer = this.router.url.startsWith('/explorer');
    if (!onExplorer) return false;
    if (this.forceLoggedIn !== null) return this.forceLoggedIn;
    return this.userService.isLoggedIn();
  }

  logout(): void {
    this.menuOpen = false;
    this.userService.logout();
    this.router.navigate(['/']);
  }

   ngOnInit(): void {
    this.activeSection = 'hero';
      const fakeEvent = new Event('click');
  fakeEvent.preventDefault = () => {};
  this.scrollToSection('hero', fakeEvent);
    
  }



  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
    if (this.isManualScroll) return;
    this.updateActiveSection();
  }

  updateActiveSection(): void {
    const sections = ['footer', 'features', 'hero'];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100) { this.activeSection = id; break; }
      }
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) this.menuOpen = false;
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }

  goLogin(): void {
    this.menuOpen = false;
    this.router.navigate(['/connexion']);
  }

  goDashboard(): void {
    this.menuOpen = false;
    this.router.navigate(['/dashboard']);
  }

  scrollToSection(id: string, event: Event): void {
    event.preventDefault();
    this.menuOpen       = false;
    this.activeSection  = id;
    this.isManualScroll = true;
    if (this.manualScrollTimer) clearTimeout(this.manualScrollTimer);
    this.manualScrollTimer = setTimeout(() => { this.isManualScroll = false; }, 900);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollTo(id: string, event: Event): void { this.scrollToSection(id, event); }
}