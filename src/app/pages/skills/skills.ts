import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService, Skill } from '../../portfolio';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skills.html',
  styleUrl: './skills.css'
})
export class Skills {
  private portfolio = inject(PortfolioService);

  readonly skills = this.portfolio.skills;

  showForm = signal(false);
  editingId = signal<string | null>(null);  // string, pas number

  readonly categories = ['Frontend', 'Backend', 'Langage', 'Base de données', 'DevOps', 'Autre'];

  form: Omit<Skill, 'id'> = this.emptyForm();

  private emptyForm(): Omit<Skill, 'id'> {
    return { name: '', pct: 80, color: '#F5C518', category: 'Frontend' };
  }

  /** Regroupe les compétences par catégorie */
  readonly grouped = computed(() => {
    const map = new Map<string, Skill[]>();
    for (const s of this.skills()) {
      const cat = s.category ?? 'Autre';  // valeur par défaut si undefined
      const list = map.get(cat) ?? [];
      list.push(s);
      map.set(cat, list);
    }
    return map;
  });

  get groupEntries(): [string, Skill[]][] {
    return Array.from(this.grouped().entries());
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEdit(s: Skill): void {
    this.form = { name: s.name, pct: s.pct, color: s.color, category: s.category ?? 'Autre' };
    this.editingId.set(s.id);  // s.id est string
    this.showForm.set(true);
  }

  save(): void {
    const id = this.editingId();
    if (id !== null) {
      this.portfolio.updateSkill(id, this.form);
    } else {
      this.portfolio.addSkill(this.form);
    }
    this.showForm.set(false);
  }

  delete(id: string): void {  // string
    if (confirm('Supprimer cette compétence ?')) {
      this.portfolio.removeSkill(id);
    }
  }

  cancel(): void {
    this.showForm.set(false);
  }

  pctColor(pct: number): string {
    if (pct >= 85) return '#22c55e';
    if (pct >= 65) return '#F5C518';
    return '#fb923c';
  }
}
