import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,Sidebar,Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {}
