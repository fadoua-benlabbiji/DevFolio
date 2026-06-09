import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Footer } from '../footer/footer';
import { HeaderIndex } from '../header-index/header-index';
import { UserService, UserProfile } from '../../data/user';

@Component({
  selector: 'app-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderIndex, Footer, RouterLink],
  templateUrl: './explorer.html',
  styleUrl: './explorer.css',
})
export class Explorer implements OnInit {

  private userSvc = inject(UserService);

  profiles: UserProfile[] = [];
  searchQuery = '';
  activeSkill = '';
  Skills: string[] = [];   //liste de tout les skills
  filters: UserProfile[] = [];   
  public isLoggedIn = this.userSvc.isLoggedIn;

  ngOnInit(): void {
    this.profiles = this.userSvc.getAllProfiles();
    this.getSkills();
    this.updateFilters();
  }

  getSkills(): void {
    for (const p of this.profiles) {
      for (const s of p.skills) {
        if (!this.Skills.includes(s)) {  //eviter doublons
          this.Skills.push(s);
        }
      }
    }
  }

  updateFilters(): void {
    this.filters = [];
    for (const p of this.profiles) {

      const q = this.searchQuery.toLowerCase();
       //recherche vide
      const trouveR = !q ||
        p.username.toLowerCase().includes(q) ||
        p.titre.toLowerCase().includes(q) ||
        p.ville.toLowerCase().includes(q) ||
        p.skills.some(s => s.toLowerCase().includes(q));
        //skill vide 
      const trouveS = !this.activeSkill || p.skills.includes(this.activeSkill);

      if (trouveR && trouveS) {
        this.filters.push(p);
      }
    }
  }

  changerSkill(skill: string): void {
    this.activeSkill = skill;
    this.updateFilters();
  }

}