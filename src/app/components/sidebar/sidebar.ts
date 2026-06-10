import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../data/user';
import { PortfolioService } from '../../data/portfolio';
import { TronquerPipe } from '../../tronquer-pipe';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule ,TronquerPipe],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {

  private userSvc      = inject(UserService);
  private portfolioSvc = inject(PortfolioService);
  private router       = inject(Router);
  //pour l envoi du titre 
  @Output() titleChange = new EventEmitter<string>();
  public user = computed(() => {
    const u = this.userSvc.currentUser();
    const p = this.userSvc.myProfile();
    return {
      name:     u ? `${u.prenom} ${u.nom}` : '',
      username: p?.username ? `@${p.username}` : '',
      email:    u && u.email ? u.email : '',
      avatar:   p && p.avatar ? p.avatar : null
    };
  });
   //nombre de message non lu
   nb : number= this.portfolioSvc.unreadCount();

  isActive(route: string): boolean {
    //recupere page actuel
    const url = this.router.url;
    if (route === '/dashboard/projects') {
      return url.startsWith('/dashboard/projects') || url.startsWith('/dashboard/project-detail');
    }
    return url.startsWith(route);
  }
  
  logout(): void {
    this.userSvc.logout();
    this.router.navigate(['/']);
  }

}
