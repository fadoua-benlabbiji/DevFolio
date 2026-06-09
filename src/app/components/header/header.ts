import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserService } from '../../data/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  @Input() title: string = '';

  private router = inject(Router);
  private userService = inject(UserService);
    logout(): void {
    this.userService.logout();
    this.router.navigate(['/']);
  }
}