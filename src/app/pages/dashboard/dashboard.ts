import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { RouterOutlet } from '@angular/router';
import { VueEnsemble } from '../../components/vue-ensemble/vue-ensemble';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,Sidebar,Header,RouterOutlet,VueEnsemble],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {}
