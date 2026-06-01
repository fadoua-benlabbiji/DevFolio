import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Acceuil } from './pages/acceuil/acceuil';
import { Connextion } from './pages/connexion/connexion';
import { Inscription } from './pages/inscription/inscription';
import { Explorer } from './components/explorer/explorer';

export const routes: Routes = [
     { path: '', component: Dashboard},
     { path: '', component: Acceuil },
     { path: 'connexion', component: Connextion },
     { path: 'inscription', component: Inscription },
     { path: 'explorer', component: Explorer },
     { path: '**', redirectTo: '' }
];
