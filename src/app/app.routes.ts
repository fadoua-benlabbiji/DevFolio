import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Acceuil } from './pages/acceuil/acceuil';
import { Connextion } from './pages/connexion/connexion';
import { Inscription } from './pages/inscription/inscription';
import { Explorer } from './components/explorer/explorer';
import { VueEnsemble } from './components/vue-ensemble/vue-ensemble';
import { Projects } from './pages/projects/projects';
import { ProjectDetail } from './pages/project-detail/project-detail';
import { authGuard } from './auth-guard';
import { Parametres } from './pages/parametres/parametres';

export const routes: Routes = [
  { path: 'connexion',   component: Connextion },
  { path: 'inscription', component: Inscription },
  { path: 'acceuil',     component: Acceuil },
  { path: 'explorer',    component: Explorer },
  {
    path: '',
    component: Dashboard,
    children: [
      { path: '',              redirectTo: 'vue-ensemble', pathMatch: 'full' },
      { path: 'vue-ensemble',  component: Parametres },
      { path: 'projects',      component: Projects },
      { path: 'portfolio/projetDetail/:id', component: ProjectDetail },
      {path:'parametres' , component:Parametres},
    ]
  },
  { path: '**', redirectTo: '' }
];