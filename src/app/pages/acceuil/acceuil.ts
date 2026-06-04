import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { HeaderIndex } from '../../components/header-index/header-index';
import { Footer } from '../../components/footer/footer';

export interface Profile {
  id: number;
  nom: string;
  titre: string;
  bio: string;
  ville: string;
  projets: number;
  skills: string[];
  avatar: string;
  featured: boolean;
}

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderIndex, Footer],
  templateUrl: './acceuil.html',
  styleUrls: ['./acceuil.css'],
})
export class Acceuil implements OnInit {

  profiles: Profile[] = [];

  features = [
    {
      icon: 'palette',
      title: 'Design 100% personnalisable',
      desc: 'Choisissez vos couleurs, polices et styles. Votre portfolio vous ressemble vraiment.'
    },
    {
      icon: 'bolt',
      title: 'Aperçu en temps réel',
      desc: 'Voyez chaque modification instantanément. Ce que vous éditez, vous le voyez.'
    },
    {
      icon: 'devices',
      title: 'Responsive Design',
      desc: 'Votre portfolio est parfait sur mobile, tablette et desktop.'
    },
    {
      icon: 'dashboard_customize',
      title: 'Templates professionnels',
      desc: '3 templates modernes conçus pour impressionner dès le premier regard.'
    },
    {
      icon: 'save',
      title: 'Sauvegarde automatique',
      desc: 'Vos données sont sauvegardées localement. Reprenez où vous en étiez.'
    },
    {
      icon: 'rocket_launch',
      title: 'Simple et rapide',
      desc: 'Créez votre portfolio en moins de 10 minutes. Aucune compétence technique requise.'
    }
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<Profile[]>('assets/profiles.json').subscribe({
      next: (data) => this.profiles = data,
      error: (err) => console.error('Erreur lors du chargement des profils', err)
    });
  }

  goRegister(): void {
    this.router.navigate(['/inscription']);
  }
}