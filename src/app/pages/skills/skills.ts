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

  readonly skills = this.portfolio.mySkills;

  showForm       = signal(false);
  editingId      = signal<number | null>(null);
  activeCategory = signal<string>('Tous');

  readonly categories = [
    'Frontend',
    'Backend',
    'Langage',
    'Base de données',
    'DevOps',
    'Autre'
  ];

  getCategoryColor(cat: string): string {
    const map: Record<string, string> = {
      'Frontend':        '#3b82f6',
      'Backend':         '#22c55e',
      'Langage':         '#f59e0b',
      'Base de données': '#ec4899',
      'DevOps':          '#fb923c',
      'Autre':           '#9ca3af',
    };
    return map[cat] ?? '#9ca3af';
  }

  countByCategory(cat: string): number {
    return this.skills().filter(s => s.category === cat).length;
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  form: Omit<Skill, 'id'> = this.emptyForm();

  private emptyForm(): Omit<Skill, 'id'> {
    return { userId: 0, name: '', pct: 80, color: '#F5C518', category: 'Frontend', logo: '' };
  }

  readonly filteredGrouped = computed(() => {
    const map = new Map<string, Skill[]>();
    const filtered = this.activeCategory() === 'Tous'
      ? this.skills()
      : this.skills().filter(s => s.category === this.activeCategory());

    for (const s of filtered) {
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(cat, list);
    }
    return map;
  });

  get filteredGroupEntries(): [string, Skill[]][] {
    return Array.from(this.filteredGrouped().entries());
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.showForm.set(true);
  }

  openEdit(s: Skill): void {
    this.form = {
      userId: s.userId,
      name: s.name,
      pct: s.pct,
      color: s.color,
      category: s.category,
      logo: s.logo ?? ''
    };
    this.editingId.set(s.id);
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

  delete(id: number): void {
    if (confirm('Supprimer cette compétence ?')) this.portfolio.deleteSkill(id);
  }

  cancel(): void { this.showForm.set(false); }

  pctColor(pct: number): string {
    if (pct >= 85) return '#22c55e';
    if (pct >= 65) return '#f59e0b';
    return '#fb923c';
  }

  onLogoError(skill: Skill): void {
    this.portfolio.updateSkill(skill.id, { ...skill, logo: '' });
  }

  onLogoUpload(event: Event, skill: Skill): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.portfolio.updateSkill(skill.id, { ...skill, logo: reader.result as string });
    };
    reader.readAsDataURL(input.files[0]);
  }
}