import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Acceuil } from './pages/acceuil/acceuil';
import { Connextion } from './pages/connexion/connexion';
import { Inscription } from './pages/inscription/inscription';
import { Explorer } from './components/explorer/explorer';
import { VueEnsemble } from './components/vue-ensemble/vue-ensemble';

export const routes: Routes = [
  { path: 'connexion',   component: Connextion },
  { path: 'inscription', component: Inscription },
  { path: 'explorer',    component: Explorer },
  {
    path: '',
    component: Dashboard,
    children: [
      { path: '',              redirectTo: 'vue-ensemble', pathMatch: 'full' },
      { path: 'vue-ensemble',  component: VueEnsemble },
      // ajouter ici : projects, skills, messages…
    ]
  },
  { path: '**', redirectTo: '' }
];