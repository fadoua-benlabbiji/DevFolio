import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Acceuil } from './pages/acceuil/acceuil';
import { Connextion } from './pages/connexion/connexion';
import { Inscription } from './pages/inscription/inscription';
import { Explorer } from './components/explorer/explorer';
import { VueEnsemble } from './components/vue-ensemble/vue-ensemble';
import { Projects } from './pages/projects/projects';
import { Parametres } from './pages/parametres/parametres';
import { Skills } from './pages/skills/skills';
import { CV } from './pages/cv/cv';
import { MonDevfolio } from './pages/mon-devfolio/mon-devfolio';
import { ProjetPublicDetail } from './pages/projet-public-detail/projet-public-detail';
import { Messages } from './pages/messages/messages';

export const routes: Routes = [
  { path: 'connexion',   component: Connextion },
  { path: 'inscription', component: Inscription },
  { path: 'acceuil',     component: Acceuil },
  { path: 'explorer',    component: Explorer },
  {
    path: '',
    component: Dashboard,
    children: [
      { path: '',                              redirectTo: 'vue-ensemble', pathMatch: 'full' },
      { path: 'vue-ensemble',                  component: VueEnsemble },
      { path: 'projects',                      component: Projects },
      { path: 'skills',                        component: Skills },
      { path: 'messages',                      component: Messages },
      { path: 'portfolio/projet-public/:id',   component: ProjetPublicDetail },
      { path: 'parametres',                    component: Parametres },
      { path: 'cv',                            component: CV },
      { path: 'mon-devfolio',                  component: MonDevfolio },
    ]
  },
  { path: '**', redirectTo: '' }
];
