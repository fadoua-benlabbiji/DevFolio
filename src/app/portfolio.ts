import { Injectable, signal, computed } from '@angular/core';

export interface Project {
  id: number;
  name: string;
  stack: string;
  pct: number;
  color: string;
  description: string;
  readme?: string;
  logo?: string;
  github?: string;
  demo?: string;
  startDate?: string;
  endDate?: string;
  role?: string;
  technologies?: string[];
  features?: string[];
  images?: string[];
  impact?: string;
}

export interface Skill {
  id: number;
  name: string;
  pct: number;
  color: string;
  category: string;
}

export interface Message {
  id: number;
  from: string;
  avatar: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private _projects = signal<Project[]>([
    { id: 1, name: 'E-commerce Platform', stack: 'Angular · Node.js · MongoDB', pct: 100, color: '#F5C518', description: 'Plateforme e-commerce complète avec panier, paiement et gestion des stocks.', github: '#', demo: '#' },
    { id: 2, name: 'Analytics Dashboard', stack: 'React · TypeScript · D3', pct: 100, color: '#3b82f6', description: 'Dashboard analytique avec graphiques interactifs et exports PDF.', github: '#', demo: '#' },
    { id: 3, name: 'Auth Microservice', stack: 'NestJS · PostgreSQL · JWT', pct: 78, color: '#a78bfa', description: 'Service d\'authentification avec OAuth2, refresh tokens et 2FA.', github: '#' },
    { id: 4, name: 'Portfolio V2', stack: 'Angular · SCSS · Firebase', pct: 100, color: '#22c55e', description: 'Ce portfolio — conçu avec Angular 17 et déployé sur Firebase.', demo: '#' },
    { id: 5, name: 'Chat App', stack: 'React · Socket.io · Redis', pct: 45, color: '#fb923c', description: 'Application de chat en temps réel avec rooms et notifications.' },
    { id: 6, name: 'API Gateway', stack: 'NestJS · Docker · AWS', pct: 100, color: '#e879f9', description: 'Gateway centralisée pour microservices avec rate limiting et logging.', github: '#', demo: '#' },
  ]);

  private _skills = signal<Skill[]>([
    { id: 1, name: 'Angular',    pct: 92, color: '#F5C518', category: 'Frontend' },
    { id: 2, name: 'TypeScript', pct: 88, color: '#3b82f6', category: 'Langage' },
    { id: 3, name: 'Node.js',    pct: 75, color: '#22c55e', category: 'Backend' },
    { id: 4, name: 'React',      pct: 70, color: '#60a5fa', category: 'Frontend' },
    { id: 5, name: 'PostgreSQL', pct: 65, color: '#a78bfa', category: 'Base de données' },
    { id: 6, name: 'Docker',     pct: 58, color: '#fb923c', category: 'DevOps' },
    { id: 7, name: 'NestJS',     pct: 72, color: '#e879f9', category: 'Backend' },
    { id: 8, name: 'MongoDB',    pct: 60, color: '#34d399', category: 'Base de données' },
  ]);

  private _messages = signal<Message[]>([
    { id: 1, from: 'TechCorp RH', avatar: 'https://i.pravatar.cc/40?img=1', subject: 'Opportunité Angular Senior', preview: 'Bonjour, nous avons découvert votre portfolio et sommes très impressionnés...', date: '2026-06-03', read: false },
    { id: 2, from: 'StartupXYZ', avatar: 'https://i.pravatar.cc/40?img=2', subject: 'Mission freelance Angular', preview: 'Nous cherchons un développeur Angular pour une mission de 3 mois...', date: '2026-06-02', read: true },
    { id: 3, from: 'OpenSource Maroc', avatar: 'https://i.pravatar.cc/40?img=3', subject: 'Invitation contributeur', preview: 'Rejoignez notre communauté open source et contribuez à des projets...', date: '2026-05-30', read: true },
  ]);

  readonly projects = this._projects.asReadonly();
  readonly skills = this._skills.asReadonly();
  readonly messages = this._messages.asReadonly();

  readonly unreadCount = computed(() => this._messages().filter(m => !m.read).length);

  // Projets
  addProject(p: Omit<Project, 'id'>): void {
    const id = Date.now();
    this._projects.update(list => [...list, { ...p, id }]);
  }

  updateProject(id: number, changes: Partial<Project>): void {
    this._projects.update(list => list.map(p => p.id === id ? { ...p, ...changes } : p));
  }

  deleteProject(id: number): void {
    this._projects.update(list => list.filter(p => p.id !== id));
  }

  // Compétences
  addSkill(s: Omit<Skill, 'id'>): void {
    this._skills.update(list => [...list, { ...s, id: Date.now() }]);
  }

  updateSkill(id: number, changes: Partial<Skill>): void {
    this._skills.update(list => list.map(s => s.id === id ? { ...s, ...changes } : s));
  }

  deleteSkill(id: number): void {
    this._skills.update(list => list.filter(s => s.id !== id));
  }

  // Messages
  markAsRead(id: number): void {
    this._messages.update(list => list.map(m => m.id === id ? { ...m, read: true } : m));
  }

  deleteMessage(id: number): void {
    this._messages.update(list => list.filter(m => m.id !== id));
  }
}