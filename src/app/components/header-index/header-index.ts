import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-index',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header-index.html',
  styleUrl: './header-index.css',
})
export class HeaderIndex implements OnInit {
  isScrolled = false;
  menuOpen = false;
  activeSection = 'hero'; // ✅ Accueil actif par défaut
  private isManualScroll = false; // ✅ Verrou pour éviter l'écrasement au scroll
  private manualScrollTimer: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.activeSection = 'hero';
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;

    // ✅ Si c'est un scroll manuel (clic nav), on ignore la détection auto
    if (this.isManualScroll) return;

    this.updateActiveSection();
  }
updateActiveSection(): void {
  const sections = ['footer', 'features', 'hero'];
  let found = false;

  for (const id of sections) {
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= 100) {
        this.activeSection = id;
        found = true;
        break;
      }
    }
  }

  // Si on est tout en haut de la page → Accueil actif par défaut
  if (!found) {
    this.activeSection = 'hero';
  }
}

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) {
      this.menuOpen = false;
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  goLogin(): void {
    this.menuOpen = false;
    this.router.navigate(['/connexion']);
  }

  goRegister(): void {
    this.menuOpen = false;
    this.router.navigate(['/inscription']);
  }

  scrollToSection(id: string, event: Event): void {
    event.preventDefault();
    this.menuOpen = false;

    // ✅ On force l'actif immédiatement et on bloque le scroll listener
    this.activeSection = id;
    this.isManualScroll = true;

    // On libère le verrou après la fin du scroll animé (~800ms)
    if (this.manualScrollTimer) clearTimeout(this.manualScrollTimer);
    this.manualScrollTimer = setTimeout(() => {
      this.isManualScroll = false;
    }, 900);

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollTo(id: string, event: Event): void {
    this.scrollToSection(id, event);
  }
}