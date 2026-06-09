import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserService, UserProfile, Education, Language } from '../../data/user';
import { PortfolioService, Project, Skill, Experience } from '../../data/portfolio';
import { HeaderIndex } from '../../components/header-index/header-index';

@Component({
  selector: 'app-profil-public',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderIndex],
  templateUrl: './profil-public.html',
  styleUrl: './profil-public.css',
})
export class ProfilPublic implements OnInit {

  private route        = inject(ActivatedRoute);
  private userSvc      = inject(UserService);
  private portfolioSvc = inject(PortfolioService);
  private sanitizer    = inject(DomSanitizer);

  profile:     UserProfile | null = null;
  projects:    Project[]    = [];
  skills:      Skill[]      = [];
  experiences: Experience[] = [];
  educations:  Education[]  = [];
  languages:   Language[]   = [];

  activeProject = signal<Project | null>(null);
  previewView   = signal<'portfolio' | 'project-detail'>('portfolio');

  ngOnInit(): void {
    const username = this.route.snapshot.paramMap.get('username');
    if (!username) return;

    this.profile = this.userSvc.getAllProfiles().find(p => p.username === username) ?? null;
    if (!this.profile) return;

    const uid = this.profile.userId;
    this.projects    = this.portfolioSvc.getProjectsByUserId(uid);

    this.educations  = this.userSvc.getEducationsByUserId(uid);
    this.languages   = this.userSvc.getLanguagesByUserId(uid);
  }

  openProjectDetail(p: Project): void {
    this.activeProject.set(p);
    this.previewView.set('project-detail');
  }

  closeProjectDetail(): void {
    this.previewView.set('portfolio');
    this.activeProject.set(null);
  }

  parseReadme(text?: string): SafeHtml {
    if (!text) return '';
    const html = text
      .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
      .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
      .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/`([^`]+)`/g,     '<code>$1</code>')
      .replace(/^- (.+)$/gm,    '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>${m}</ul>`)
      .replace(/\n{2,}/g, '</p><p>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}