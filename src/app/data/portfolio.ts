import { Injectable, signal, computed } from '@angular/core';
import { UserService } from './user';

/* ===================== TYPES ===================== */

export interface PortfolioProfile {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone?: string;
  location: string;
  avatar: string;
  github: string;
  linkedin: string;
  website: string;
  accentColor: string;
}

export interface Project {
  id: number;
  userId: number;
  name: string;
  description: string;
  pct: number;
  color: string;
  readme?: string;
  technologies: string[];        // ✅ unique, obligatoire
  url?: string;
  github?: string;
  demo?: string;
  image?: string;
  images?: string[];
  logo?: string;
  startDate?: string;
  endDate?: string;
  role?: string;
  features?: string[];
  impact?: string;
}

export interface Skill {
  id: number;
  userId: number;
  name: string;
  pct: number;
  color: string;
  category: string;
  logo?: string;
}

export interface Experience {
  id: number;
  userId: number;
  role: string;
  company: string;
  start: string;
  end: string;
  description: string;
}

export interface Message {
  id: number;
  from: string;
  subject: string;
  preview?: string;
  avatar?: string;
  read: boolean;
  date: string;
}

/* ===================== SERVICE ===================== */

@Injectable({ providedIn: 'root' })
export class PortfolioService {

  private _profile = signal<PortfolioProfile>({
    name: '', title: '', bio: '', email: '', phone: '',
    location: '', avatar: '', github: '',
    linkedin: '', website: '', accentColor: '#F5C518'
  });

  private _projects = signal<Project[]>([
    {
      id: 1, userId: 1,
      name: 'E-commerce Platform',
      technologies: ['Angular', 'Node.js', 'Express', 'MongoDB', 'Stripe', 'Socket.io', 'JWT', 'Docker'],
      pct: 100,
      color: '#F5C518',
      description: 'Plateforme e-commerce complète avec panier, paiement et gestion des stocks.',
      github: '#', demo: '#',
      role: 'Développeur Full Stack',
      startDate: 'Jan 2024', endDate: 'Jun 2024',
      readme: 'Une plateforme e-commerce moderne construite avec Angular 17 côté frontend et Node.js/Express côté backend. Elle intègre un système de panier dynamique, une gestion des stocks en temps réel, et un tunnel de paiement sécurisé via Stripe.',
      features: [
        'Authentification JWT avec refresh tokens',
        'Panier dynamique avec persistance localStorage',
        'Intégration Stripe pour les paiements sécurisés',
        'Dashboard admin avec gestion des produits et stocks',
        'Système de recherche et filtres avancés',
        'Notifications en temps réel avec Socket.io',
      ],
      impact: 'Réduction de 40% du temps de traitement des commandes. Plus de 500 produits gérés et 1 200 utilisateurs actifs dès le premier mois de lancement.',
    },
    {
      id: 2, userId: 1,
      name: 'Analytics Dashboard',
      technologies: ['React', 'TypeScript', 'D3.js', 'Recharts', 'jsPDF', 'WebSocket', 'TailwindCSS'],
      pct: 100,
      color: '#3b82f6',
      description: 'Dashboard analytique avec graphiques interactifs et exports PDF.',
      github: '#', demo: '#',
      role: 'Frontend Developer',
      startDate: 'Mar 2024', endDate: 'Mai 2024',
      readme: 'Dashboard de visualisation de données construit avec React et D3.js. Permet d\'analyser des métriques business en temps réel avec des graphiques interactifs, des filtres dynamiques et des exports PDF automatisés.',
      features: [
        'Graphiques interactifs avec D3.js (line, bar, pie)',
        'Filtres dynamiques par période et catégorie',
        'Export PDF et CSV des rapports',
        'Mode sombre / clair',
        'Données en temps réel via WebSocket',
      ],
      impact: 'Gain de 3h/semaine pour l\'équipe analytics grâce à l\'automatisation des rapports PDF.',
    },
    {
      id: 3, userId: 1,
      name: 'Auth Microservice',
      technologies: ['NestJS', 'PostgreSQL', 'JWT', 'Passport.js', 'Redis', 'TypeORM', 'Docker'],
      pct: 78,
      color: '#a78bfa',
      description: 'Service d\'authentification avec OAuth2, refresh tokens et 2FA.',
      github: '#',
      role: 'Backend Developer',
      startDate: 'Avr 2024',
      readme: 'Microservice d\'authentification standalone construit avec NestJS. Gère l\'inscription, la connexion, les sessions JWT, le flux OAuth2 (Google, GitHub) et la double authentification (2FA) via TOTP.',
      features: [
        'OAuth2 avec Google et GitHub',
        'Double authentification TOTP (Google Authenticator)',
        'Refresh tokens avec rotation automatique',
        'Rate limiting et protection brute-force',
        'Logs d\'audit des connexions',
      ],
      impact: 'En cours de développement — phase finale d\'intégration OAuth2.',
    },
    {
      id: 4, userId: 2,
      name: 'Portfolio V2',
      technologies: ['Angular', 'SCSS', 'Firebase'],
      pct: 100, color: '#22c55e',
      description: 'Ce portfolio — conçu avec Angular 17 et déployé sur Firebase.',
      demo: '#',
    },
    {
      id: 5, userId: 2,
      name: 'Chat App',
      technologies: ['React', 'Socket.io', 'Redis'],
      pct: 45, color: '#fb923c',
      description: 'Application de chat en temps réel avec rooms et notifications.',
    },
    {
      id: 6, userId: 3,
      name: 'API Gateway',
      technologies: ['NestJS', 'Docker', 'AWS'],
      pct: 100, color: '#e879f9',
      description: 'Gateway centralisée pour microservices avec rate limiting et logging.',
      github: '#', demo: '#',
    },
  ]);

  private _skills = signal<Skill[]>([
    { id: 1,  userId: 1, name: 'Angular',    pct: 92, color: '#F5C518', category: 'Frontend' },
    { id: 2,  userId: 1, name: 'TypeScript', pct: 88, color: '#3b82f6', category: 'Langage' },
    { id: 3,  userId: 1, name: 'Node.js',    pct: 75, color: '#22c55e', category: 'Backend' },
    { id: 4,  userId: 1, name: 'MongoDB',    pct: 60, color: '#34d399', category: 'Base de données' },
    { id: 5,  userId: 2, name: 'React',      pct: 70, color: '#60a5fa', category: 'Frontend' },
    { id: 6,  userId: 2, name: 'TypeScript', pct: 85, color: '#3b82f6', category: 'Langage' },
    { id: 7,  userId: 2, name: 'CSS',        pct: 90, color: '#e879f9', category: 'Frontend' },
    { id: 8,  userId: 3, name: 'NestJS',     pct: 72, color: '#e879f9', category: 'Backend' },
    { id: 9,  userId: 3, name: 'Docker',     pct: 58, color: '#fb923c', category: 'DevOps' },
    { id: 10, userId: 3, name: 'PostgreSQL', pct: 65, color: '#a78bfa', category: 'Base de données' },
    { id: 11, userId: 3, name: 'AWS',        pct: 55, color: '#F5C518', category: 'DevOps' },
  ]);

  private _experiences = signal<Experience[]>([]);

  private _messages = signal<Message[]>([
    { id: 1, from: 'TechCorp RH',      avatar: 'https://i.pravatar.cc/40?img=1', subject: 'Opportunité Angular Senior',  preview: 'Bonjour, nous avons découvert votre portfolio...',                   date: '2026-06-03', read: false },
    { id: 2, from: 'StartupXYZ',       avatar: 'https://i.pravatar.cc/40?img=2', subject: 'Mission freelance Angular',   preview: 'Nous cherchons un développeur Angular pour une mission de 3 mois...', date: '2026-06-02', read: true  },
    { id: 3, from: 'OpenSource Maroc', avatar: 'https://i.pravatar.cc/40?img=3', subject: 'Invitation contributeur',     preview: 'Rejoignez notre communauté open source...',                          date: '2026-05-30', read: true  },
  ]);

  constructor(private userService: UserService) {}

  // ── Profile ───────────────────────────────────────────────────────────────

  readonly myProfile = this._profile.asReadonly();

  updateProfile(patch: Partial<PortfolioProfile>): void {
    this._profile.update(p => ({ ...p, ...patch }));
  }

  // ── Projets ───────────────────────────────────────────────────────────────

  readonly myProjects = computed(() => {
    const uid = this.userService.currentUser()?.id;
    if (!uid) return [];
    return this._projects().filter(p => p.userId === uid);
  });

  addProject(p: Omit<Project, 'id' | 'userId'>): void {
    const uid = this.userService.currentUser()?.id;
    if (!uid) return;
    this._projects.update(list => [...list, { ...p, id: Date.now(), userId: uid }]);
  }

  updateProject(id: number, changes: Partial<Project>): void {
    this._projects.update(list => list.map(p => p.id === id ? { ...p, ...changes } : p));
  }

  removeProject(id: number): void {
    this._projects.update(list => list.filter(p => p.id !== id));
  }

  // ── Compétences ───────────────────────────────────────────────────────────

  readonly mySkills = computed(() => {
    const uid = this.userService.currentUser()?.id;
    if (!uid) return [];
    return this._skills().filter(s => s.userId === uid);
  });

  addSkill(s: Omit<Skill, 'id' | 'userId'>): void {
    const uid = this.userService.currentUser()?.id;
    if (!uid) return;
    this._skills.update(list => [...list, { ...s, id: Date.now(), userId: uid }]);
  }

  updateSkill(id: number, changes: Partial<Skill>): void {
    this._skills.update(list => list.map(s => s.id === id ? { ...s, ...changes } : s));
  }

  deleteSkill(id: number): void {
    this._skills.update(list => list.filter(s => s.id !== id));
  }

  // ── Experiences ───────────────────────────────────────────────────────────

  readonly myExperiences = computed(() => {
    const uid = this.userService.currentUser()?.id;
    if (!uid) return [];
    return this._experiences().filter(e => e.userId === uid);
  });

  addExperience(e: Omit<Experience, 'id' | 'userId'>): void {
    const uid = this.userService.currentUser()?.id;
    if (!uid) return;
    this._experiences.update(list => [...list, { ...e, id: Date.now(), userId: uid }]);
  }

  removeExperience(id: number): void {
    this._experiences.update(list => list.filter(e => e.id !== id));
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  readonly messages    = this._messages.asReadonly();
  readonly unreadCount = computed(() => this._messages().filter(m => !m.read).length);

  markAsRead(id: number): void {
    this._messages.update(list => list.map(m => m.id === id ? { ...m, read: true } : m));
  }

  deleteMessage(id: number): void {
    this._messages.update(list => list.filter(m => m.id !== id));
  }
}