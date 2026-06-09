import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HeaderIndex } from '../../components/header-index/header-index';
import { Footer } from '../../components/footer/footer';
import { UserService, UserProfile } from '../../data/user';

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderIndex, Footer],
  templateUrl: './acceuil.html',
  styleUrls: ['./acceuil.css'],
})
export class Acceuil implements OnInit {

  private userSvc = inject(UserService);
  private router  = inject(Router);

  profiles: UserProfile[] = [];

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

  ngOnInit(): void {
    // Charge les profils featured depuis UserService (plus de dépendance JSON)
    this.profiles = this.userSvc.getAllProfiles().filter(p => p.featured);
  }

  goRegister(): void {
    this.router.navigate(['/inscription']);
  }
}
