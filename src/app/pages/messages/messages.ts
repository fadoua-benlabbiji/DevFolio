import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService, Message } from '../../data/portfolio';
import { UserService } from '../../data/user';

// ── Pipe aperçu ───────────────────────────────────────────────────────────────
@Pipe({ name: 'apercu', standalone: true })
export class ApercuPipe implements PipeTransform {
  transform(value: string | undefined, max = 60): string {
    if (!value) return '';
    return value.length > max ? value.slice(0, max) + '…' : value;
  }
}

type Onglet = 'reçus' | 'envoyés';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, ApercuPipe],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css'],
})
export class Messages implements OnInit {

  private portfolioSvc = inject(PortfolioService);
  private userSvc      = inject(UserService);

  // ── État ──────────────────────────────────────────────────────────────────
  ongletActif  = signal<Onglet>('reçus');
  selectedId   = signal<number | null>(null);
  showCompose  = signal(false);
  searchQuery  = signal('');

  // Formulaire nouveau message
  composeForm = signal({ toName: '', subject: '', body: '' });

  // ── Sources de données ────────────────────────────────────────────────────
  readonly received = this.portfolioSvc.receivedMessages;
  readonly sent     = this.portfolioSvc.sentMessages;
  readonly unread   = this.portfolioSvc.unreadCount;

  // ── Liste filtrée selon l'onglet + recherche ──────────────────────────────
  readonly filteredList = computed<Message[]>(() => {
    const source = this.ongletActif() === 'reçus' ? this.received() : this.sent();
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return source;
    return source.filter(m =>
      m.subject.toLowerCase().includes(q) ||
      m.fromName.toLowerCase().includes(q) ||
      m.body.toLowerCase().includes(q)
    );
  });

  // ── Message sélectionné ───────────────────────────────────────────────────
  readonly selectedMessage = computed<Message | null>(() => {
    const id = this.selectedId();
    if (id === null) return null;
    const all = [...this.received(), ...this.sent()];
    return all.find(m => m.id === id) ?? null;
  });

  ngOnInit(): void {
    // Sélectionner le premier message reçu par défaut
    const first = this.received()[0];
    if (first) this.select(first);
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  changerOnglet(onglet: Onglet): void {
    this.ongletActif.set(onglet);
    this.selectedId.set(null);
  }

  select(msg: Message): void {
    this.selectedId.set(msg.id);
    if (!msg.read && this.ongletActif() === 'reçus') {
      this.portfolioSvc.markAsRead(msg.id);
    }
  }

  supprimer(id: number): void {
    this.portfolioSvc.deleteMessage(id);
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  // ── Composer ──────────────────────────────────────────────────────────────
  openCompose(): void {
    this.composeForm.set({ toName: '', subject: '', body: '' });
    this.showCompose.set(true);
  }

  closeCompose(): void {
    this.showCompose.set(false);
  }

  setField(field: 'toName' | 'subject' | 'body', value: string): void {
    this.composeForm.update(f => ({ ...f, [field]: value }));
  }

  envoyer(): void {
    const f = this.composeForm();
    if (!f.toName.trim() || !f.subject.trim() || !f.body.trim()) return;

    this.portfolioSvc.sendMessage({
      toUserId: 0,           // destinataire externe (id 0 = contact externe)
      subject: f.subject.trim(),
      body: f.body.trim(),
    });

    this.showCompose.set(false);
    this.ongletActif.set('envoyés');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  initiales(nom: string): string {
    return nom
      .split(' ')
      .slice(0, 2)
      .map(w => w.charAt(0).toUpperCase())
      .join('');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }
}
