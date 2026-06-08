import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Profile } from '../../pages/acceuil/acceuil';
import { Footer } from '../footer/footer';
import { HeaderIndex } from '../header-index/header-index';
import { UserService } from '../../data/user';
import { ProfileService } from '../../data/profile';

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderIndex, Footer, RouterLink],
  templateUrl: './explorer.html',
  styleUrl: './explorer.css',
})
export class Explorer implements OnInit {
  private userService    = inject(UserService);
  private profileService = inject(ProfileService);

  profiles: Profile[] = [];
  searchQuery = '';
  activeSkill = '';

  // ✅ Session
  readonly isLoggedIn = this.userService.isLoggedIn;

  ngOnInit(): void {
    // ✅ Charger les profils depuis ProfileService au lieu du JSON
    this.profiles = this.profileService.getAll() as any[];
  }

  get allSkills(): string[] {
    const skills = this.profiles.flatMap(p => p.skills);
    return [...new Set(skills)].sort();
  }

  get filteredProfiles(): Profile[] {
    return this.profiles.filter(p => {
      const q = this.searchQuery.toLowerCase();
      const matchSearch = !q ||
        p.nom.toLowerCase().includes(q) ||
        p.titre.toLowerCase().includes(q) ||
        p.ville.toLowerCase().includes(q) ||
        p.skills.some(s => s.toLowerCase().includes(q));
      const matchSkill = !this.activeSkill || p.skills.includes(this.activeSkill);
      return matchSearch && matchSkill;
    });
  }

  filterBySkill(skill: string): void {
    this.activeSkill = this.activeSkill === skill ? '' : skill;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.activeSkill = '';
  }
}