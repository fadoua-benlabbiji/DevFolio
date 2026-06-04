import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vue-ensemble',
  imports: [CommonModule],
  templateUrl: './vue-ensemble.html',
  styleUrl: './vue-ensemble.css',
})
export class VueEnsemble implements OnInit {
 user = { name: 'Yassine' };
  today = '';

  skills = [
    { name: 'Angular',    pct: 92, color: '#F5C518' },
    { name: 'TypeScript', pct: 88, color: '#3b82f6' },
    { name: 'Node.js',    pct: 75, color: '#22c55e' },
    { name: 'React',      pct: 70, color: '#60a5fa' },
    { name: 'PostgreSQL', pct: 65, color: '#a78bfa' },
    { name: 'Docker',     pct: 58, color: '#fb923c' },
    { name: 'NestJS',     pct: 72, color: '#e879f9' },
    { name: 'MongoDB',    pct: 60, color: '#34d399' },
  ];

  projects = [
    { name: 'E-commerce Platform', stack: 'Angular · Node.js · MongoDB', pct: 100, color: '#F5C518' },
    { name: 'Analytics Dashboard', stack: 'React · TypeScript · D3',      pct: 100, color: '#3b82f6' },
    { name: 'Auth Microservice',   stack: 'NestJS · PostgreSQL · JWT',     pct: 78,  color: '#a78bfa' },
    { name: 'Portfolio V2',        stack: 'Angular · SCSS · Firebase',     pct: 100, color: '#22c55e' },
    { name: 'Chat App',            stack: 'React · Socket.io · Redis',     pct: 45,  color: '#fb923c' },
    { name: 'API Gateway',         stack: 'NestJS · Docker · AWS',         pct: 100, color: '#e879f9' },
  ];

stats = [
  { label: 'Projets réalisés', value: '6' },
  { label: 'Compétences',      value: '8' },
  { label: 'Messages non lus', value: '1' },
];

  ngOnInit(): void {
    this.today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}
