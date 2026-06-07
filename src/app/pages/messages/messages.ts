// messages.ts
import {
  Component, inject, signal, computed,
  ViewChild, ElementRef, AfterViewChecked, Pipe, PipeTransform
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ChatMessage } from '../../message';
import { AuthService } from '../../auth';

// ─── Pipe tronquer pour les previews ─────────────────────────
@Pipe({ name: 'msgTronquer', standalone: true })
export class MsgTronquerPipe implements PipeTransform {
  transform(value: string | undefined, maxLen = 45): string {
    if (!value) return '';
    return value.length > maxLen ? value.slice(0, maxLen) + '…' : value;
  }
}

// ─── Composant Messages ───────────────────────────────────────
@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, MsgTronquerPipe],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css']
})
export class Messages implements AfterViewChecked {
  readonly msgSvc  = inject(MessageService);
  private  auth    = inject(AuthService);

  @ViewChild('chatBody') private chatBodyRef!: ElementRef<HTMLDivElement>;
  @ViewChild('msgInput') private msgInputRef!: ElementRef<HTMLTextAreaElement>;

  // ── State local ──
  searchQuery = '';
  draftText   = '';
  isTyping    = signal(false);

  private shouldScrollBottom = true;
  private typingTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Mon identifiant ──
  get myId(): number {
    return this.auth.currentUser()?.id ?? 0;
  }

  // ── Conversations filtrées par recherche ──
  readonly filteredConversations = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.msgSvc.conversations();
    return this.msgSvc.conversations().filter(c =>
      c.contactName.toLowerCase().includes(q) ||
      c.contactTitle.toLowerCase().includes(q)
    );
  });

  // ── Sélectionner une conversation ──
  selectConv(id: string): void {
    this.msgSvc.selectConversation(id);
    this.shouldScrollBottom = true;
    this.draftText = '';
  }

  // ── Envoyer un message ──
  send(): void {
    const convId = this.msgSvc.selectedId();
    if (!convId || !this.draftText.trim()) return;

    this.msgSvc.sendMessage(convId, this.draftText, this.myId);
    this.draftText = '';
    this.shouldScrollBottom = true;

    // Simuler "en train d'écrire" après envoi
    this._showTyping();

    // Auto-resize du textarea
    if (this.msgInputRef) {
      this.msgInputRef.nativeElement.style.height = 'auto';
    }
  }

  // ── Touche Entrée (Shift+Entrée = saut de ligne) ──
  onEnter(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  // ── Vérifier si c'est le dernier message consécutif d'un contact ──
  isLastInGroup(messages: ChatMessage[], current: ChatMessage): boolean {
    const idx = messages.indexOf(current);
    if (idx === messages.length - 1) return true;
    return messages[idx + 1].senderId !== current.senderId;
  }

  // ── Simuler l'indicateur "en train d'écrire" ──
  private _showTyping(): void {
    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.isTyping.set(true);
    this.typingTimer = setTimeout(() => {
      this.isTyping.set(false);
    }, 4000);
  }

  // ── Scroll auto vers le bas ──
  ngAfterViewChecked(): void {
    if (this.shouldScrollBottom && this.chatBodyRef) {
      const el = this.chatBodyRef.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScrollBottom = false;
    }
  }
}