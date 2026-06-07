import { Injectable, signal, computed } from '@angular/core';

/* ===================== TYPES ===================== */

export interface Project {
  id: string;
  name: string;
  description: string;
  pct: number;
  color: string;

  readme?: string;
  tech?: string[];
  technologies?: string[];

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
  stack: string; 
}

export interface Skill {
  id: string;
  name: string;
  pct: number;
  color: string;
  category?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  start: string;
  end: string;
  description: string;
}

export interface PortfolioProfile {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  github: string;
  linkedin: string;
  website: string;
  accentColor: string;
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

  /* ---------- PROFILE ---------- */
  readonly profile = signal<PortfolioProfile>({
    name: 'Lina Bensalem',
    title: 'Développeuse Full-Stack',
    bio: 'Passionnée par les interfaces modernes.',
    email: 'lina@example.com',
    phone: '+212 612 345 678',
    location: 'Casablanca',
    avatar: 'https://i.pravatar.cc/150?img=12',
    github: 'https://github.com/lina-dev',
    linkedin: 'https://linkedin.com/in/lina-dev',
    website: 'https://lina.dev',
    accentColor: '#F5C518',
  });

  updateProfile(patch: Partial<PortfolioProfile>) {
    this.profile.update(p => ({ ...p, ...patch }));
  }

  /* ---------- PROJECTS ---------- */
  readonly projects = signal<Project[]>([
    {
      id: 'taskflow',
      name: 'TaskFlow',
      description: 'App de gestion de tâches collaborative en temps réel avec tableau Kanban drag-and-drop.',
      stack: 'React · TypeScript · Supabase · Tailwind',
      pct: 100,
      color: '#F5C518',
      tech: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
      technologies: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'React DnD'],
      github: 'https://github.com/lina/taskflow',
      url: 'https://taskflow.app',
      demo: 'https://taskflow-demo.vercel.app',
      readme: 'Tableau Kanban collaboratif avec synchronisation temps réel via Supabase Realtime. Authentification OAuth, drag-and-drop des cartes, notifications push et mode hors-ligne.',
      role: 'Lead Developer',
      startDate: '2025-01',
      endDate: '2025-04',
      features: ['Kanban drag-and-drop', 'Temps réel multi-utilisateur', 'Notifications push', 'Mode hors-ligne'],
      impact: '+40% de productivité rapportée par les équipes pilotes',
    },
    {
      id: 'shoplite',
      name: 'ShopLite',
      description: 'Plateforme e-commerce légère et performante avec paiement intégré Stripe.',
      stack: 'Next.js · Stripe · PostgreSQL · Prisma',
      pct: 100,
      color: '#22d3ee',
      tech: ['Next.js', 'Stripe', 'PostgreSQL', 'Prisma'],
      technologies: ['Next.js 14', 'Stripe', 'PostgreSQL', 'Prisma ORM', 'Vercel'],
      github: 'https://github.com/lina/shoplite',
      url: 'https://shoplite.vercel.app',
      demo: 'https://shoplite-demo.vercel.app',
      readme: 'E-commerce optimisé SEO avec App Router Next.js 14, paiement Stripe, gestion stock, tableau de bord admin et emails transactionnels.',
      role: 'Full Stack Developer',
      startDate: '2024-09',
      endDate: '2024-12',
      features: ['Paiement Stripe 3DS', 'SEO optimisé', 'Dashboard admin', 'Emails transactionnels'],
      impact: '98/100 score Lighthouse, 2s de chargement moyen',
    },
    {
      id: 'devblog',
      name: 'DevBlog CMS',
      description: 'CMS headless pour blog technique avec éditeur Markdown et gestion des auteurs.',
      stack: 'NestJS · Angular · MongoDB · JWT',
      pct: 85,
      color: '#8B5CF6',
      tech: ['NestJS', 'Angular', 'MongoDB', 'JWT'],
      technologies: ['NestJS', 'Angular 17', 'MongoDB', 'JWT', 'Marked.js'],
      github: 'https://github.com/lina/devblog',
      readme: 'CMS headless avec éditeur Markdown WYSIWYG, gestion multi-auteurs, système de tags, recherche full-text et export RSS.',
      role: 'Architecte & Développeuse',
      startDate: '2024-06',
      endDate: '2024-08',
      features: ['Éditeur Markdown WYSIWYG', 'Multi-auteurs', 'Recherche full-text', 'Export RSS'],
      impact: 'Adopté par 3 équipes internes pour la documentation technique',
    },
    {
      id: 'weatherai',
      name: 'WeatherAI',
      description: 'Dashboard météo intelligent avec prévisions IA et visualisations interactives.',
      stack: 'Python · FastAPI · React · Chart.js',
      pct: 75,
      color: '#10B981',
      tech: ['Python', 'FastAPI', 'React', 'Chart.js'],
      technologies: ['Python 3.11', 'FastAPI', 'React', 'Chart.js', 'OpenWeatherMap API'],
      github: 'https://github.com/lina/weatherai',
      readme: 'Dashboard météo avec API OpenWeatherMap, modèle IA de prévision personnalisée, cartes interactives Leaflet et alertes météo configurables.',
      role: 'Développeuse Full Stack',
      startDate: '2024-03',
      endDate: '2024-05',
      features: ['Prévisions IA 7 jours', 'Cartes interactives', 'Alertes personnalisables', 'Données historiques'],
      impact: 'En cours — intégration modèle ML maison',
    },
  ]);

  addProject(project: Omit<Project, 'id'>) {
    this.projects.update(list => [
      ...list,
      { ...project, id: Date.now().toString(36) }
    ]);
  }

  updateProject(id: string, patch: Partial<Project>) {
    this.projects.update(list =>
      list.map(p => p.id === id ? { ...p, ...patch } : p)
    );
  }

  removeProject(id: string) {
    this.projects.update(list => list.filter(p => p.id !== id));
  }

  /* ---------- SKILLS ---------- */
  readonly skills = signal<Skill[]>([
    // Frontend
    { id: 's1',  name: 'Angular',        pct: 92, color: '#DD0031', category: 'technique' },
    { id: 's2',  name: 'React',          pct: 88, color: '#61DAFB', category: 'technique' },
    { id: 's3',  name: 'TypeScript',     pct: 90, color: '#3178C6', category: 'technique' },
    { id: 's4',  name: 'HTML / CSS',     pct: 95, color: '#E34F26', category: 'technique' },
    { id: 's5',  name: 'Tailwind CSS',   pct: 85, color: '#06B6D4', category: 'technique' },
    // Backend
    { id: 's6',  name: 'Node.js',        pct: 82, color: '#339933', category: 'technique' },
    { id: 's7',  name: 'NestJS',         pct: 75, color: '#E0234E', category: 'technique' },
    { id: 's8',  name: 'Python / FastAPI', pct: 70, color: '#3776AB', category: 'technique' },
    { id: 's9',  name: 'PostgreSQL',     pct: 78, color: '#336791', category: 'technique' },
    { id: 's10', name: 'MongoDB',        pct: 72, color: '#47A248', category: 'technique' },
    // DevOps / Outils
    { id: 's11', name: 'Docker',         pct: 68, color: '#2496ED', category: 'technique' },
    { id: 's12', name: 'Git / GitHub',   pct: 90, color: '#F05032', category: 'technique' },
    // Soft skills
    { id: 's13', name: 'Communication',  pct: 88, color: '#8B5CF6', category: 'soft' },
    { id: 's14', name: 'Travail en équipe', pct: 92, color: '#EC4899', category: 'soft' },
    { id: 's15', name: 'Résolution de problèmes', pct: 85, color: '#F59E0B', category: 'soft' },
    { id: 's16', name: 'Adaptabilité',   pct: 87, color: '#10B981', category: 'soft' },
  ]);

  addSkill(skill: Omit<Skill, 'id'>) {
    this.skills.update(list => [
      ...list,
      { ...skill, id: Date.now().toString(36) }
    ]);
  }

  updateSkill(id: string, patch: Partial<Skill>) {
    this.skills.update(list =>
      list.map(s => s.id === id ? { ...s, ...patch } : s)
    );
  }

  removeSkill(id: string) {
    this.skills.update(list => list.filter(s => s.id !== id));
  }

  /* ---------- EXPERIENCE ---------- */
  readonly experiences = signal<Experience[]>([
    {
      id: 'e1',
      role: 'Développeuse Full Stack',
      company: 'TechCorp Morocco',
      start: '2024',
      end: 'Présent',
      description: "Développement et maintenance d'applications web Angular + NestJS. Mise en place de pipelines CI/CD Docker/GitHub Actions. Refactoring d'une API legacy vers une architecture microservices.",
    },
    {
      id: 'e2',
      role: 'Développeuse Frontend',
      company: 'Agence Digit',
      start: '2023',
      end: '2024',
      description: "Intégration de maquettes Figma en Angular 16, développement de composants réutilisables, optimisation des performances (Lighthouse 95+). Collaboration directe avec les designers UX.",
    },
    {
      id: 'e3',
      role: 'Stagiaire Développeuse Web',
      company: 'StartupHub Casablanca',
      start: '2022',
      end: '2023',
      description: "Développement de features React sur une plateforme SaaS B2B. Rédaction de tests unitaires Jest, participation aux sprints Agile et revues de code.",
    },
  ]);

  addExperience(exp: Omit<Experience, 'id'>) {
    this.experiences.update(list => [
      { ...exp, id: Date.now().toString(36) },
      ...list
    ]);
  }

  removeExperience(id: string) {
    this.experiences.update(list =>
      list.filter(e => e.id !== id)
    );
  }

  /* ---------- MESSAGES ---------- */
  readonly messages = signal<Message[]>([
    {
      id: 1,
      from: 'TechCorp RH',
      subject: 'Opportunité Angular',
      preview: 'Nous avons vu votre portfolio...',
      avatar: 'https://i.pravatar.cc/40?img=1',
      read: false,
      date: '2026-06-03',
    }
  ]);

  readonly unreadCount = computed(
    () => this.messages().filter(m => !m.read).length
  );

  markAsRead(id: number) {
    this.messages.update(list =>
      list.map(m => m.id === id ? { ...m, read: true } : m)
    );
  }

  deleteMessage(id: number) {
    this.messages.update(list =>
      list.filter(m => m.id !== id)
    );
  }
}