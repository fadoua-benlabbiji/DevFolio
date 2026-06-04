import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


import { Profile } from '../../pages/acceuil/acceuil';

import { Footer } from '../footer/footer';
import { HeaderIndex } from '../header-index/header-index';

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderIndex, Footer],
  templateUrl: './explorer.html',
  styleUrl: './explorer.css',
})
export class Explorer implements OnInit {
  profiles: Profile[] = [];
  searchQuery = '';
  activeSkill = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Profile[]>('assets/profiles.json').subscribe({
      next: (data) => this.profiles = data,
      error: (err) => console.error('Erreur chargement profiles.json', err)
    });
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
