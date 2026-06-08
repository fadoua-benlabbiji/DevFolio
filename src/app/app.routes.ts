import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Acceuil } from './pages/acceuil/acceuil';
import { Connexion } from './pages/connexion/connexion';
import { Inscription } from './pages/inscription/inscription';
import { Explorer } from './components/explorer/explorer';
import { VueEnsemble } from './components/vue-ensemble/vue-ensemble';
import { ProjectDetail } from './pages/project-detail/project-detail';
import { Projects } from './pages/projects/projects';
import { authGuard } from './auth-guard';
import { Skills } from './pages/skills/skills';
import { CV } from './pages/cv/cv';
import { Parametres } from './pages/parametres/parametres';
import { Messages } from './pages/messages/messages';
import { MonDevfolio } from './pages/mon-devfolio/mon-devfolio';
import { ProjetPublicDetail } from './pages/projet-public-detail/projet-public-detail';
export const routes: Routes = [
  { path: '', component: Acceuil },
  { path: 'connexion', component: Connexion },
  { path: 'inscription', component: Inscription },
  { path: 'explorer', component: Explorer },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard], // ← protégé : nécessite d'être connecté
children: [
  { path: '', redirectTo: 'vue-ensemble', pathMatch: 'full' },
  { path: 'vue-ensemble', component: VueEnsemble },
  { path: 'projects', component: Projects },
  { path: 'skills', component: Skills },
  { path: 'cv', component: CV },
  { path: 'messages', component: Messages},
  {path : 'devfolio',component : MonDevfolio},
  { path: 'settings', component: Parametres },
  { path: 'project-detail/:id', component: ProjectDetail }
 
],
  
  },
    
  { path: '**', redirectTo: '' },
];