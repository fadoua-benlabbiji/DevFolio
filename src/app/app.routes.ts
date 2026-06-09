import { Routes } from '@angular/router';
import { Acceuil } from './pages/acceuil/acceuil';
import { Connexion } from './pages/connexion/connexion';
import { Inscription } from './pages/inscription/inscription';
import { Explorer } from './components/explorer/explorer';
import { Dashboard } from './pages/dashboard/dashboard';
import { VueEnsemble } from './components/vue-ensemble/vue-ensemble';
import { Projects } from './pages/projects/projects';
import { ProjectDetail } from './pages/project-detail/project-detail';
import { Skills } from './pages/skills/skills';
import { CV } from './pages/cv/cv';
import { Messages } from './pages/messages/messages';
import { MonDevfolio } from './pages/mon-devfolio/mon-devfolio';
import { Parametres } from './pages/parametres/parametres';
import { authGuard } from './data/auth-guard';

export const routes: Routes = [
  { path: '', component: Acceuil },
  { path: 'connexion', component: Connexion },
  { path: 'inscription', component: Inscription },
  { path: 'explorer', component: Explorer },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'vue-ensemble', pathMatch: 'full' },
      { path: 'vue-ensemble', component: VueEnsemble },
      { path: 'projects', component: Projects },
      { path: 'project-detail/:id', component: ProjectDetail },
      { path: 'skills', component: Skills },
      { path: 'cv', component: CV },
      { path: 'messages', component: Messages },
      { path: 'devfolio', component: MonDevfolio },
      { path: 'settings', component: Parametres },
    ],
  },
  { path: '**', redirectTo: '' },
];
