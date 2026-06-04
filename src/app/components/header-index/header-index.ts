import { Component, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-index',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header-index.html',
  styleUrl: './header-index.css',
})
export class HeaderIndex {
   isScrolled = false;
  menuOpen = false;

  constructor(private router: Router) {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
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

  scrollTo(id: string, event: Event): void {
    event.preventDefault();
    this.menuOpen = false;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
