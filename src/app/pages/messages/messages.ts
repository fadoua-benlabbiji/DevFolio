// messages.ts
import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  Pipe,
  PipeTransform
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ChatMessage } from '../../data/message';

// ─── Pipe tronquer pour les previews ─────────────────────────
@Pipe({
  name: 'msgTronquer',
  standalone: true
})
export class MsgTronquerPipe implements PipeTransform {
  transform(value: string | undefined, maxLen = 45): string {
    if (!value) return '';
    return value.length > maxLen
      ? value.slice(0, maxLen) + '…'
      : value;
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

  readonly msgSvc = inject(MessageService);

  @ViewChild('chatBody')
  private chatBodyRef!: ElementRef<HTMLDivElement>;

  @ViewChild('msgInput')
  private msgInputRef!: ElementRef<HTMLTextAreaElement>;

  // ── State local ─────────────────────────────────────────────
  searchQuery = '';
  draftText = '';
  isTyping = signal(false);

  private shouldScrollBottom = true;
  private typingTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Conversations filtrées ─────────────────────────────────
  readonly filteredConversations = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();

    if (!q) {
      return this.msgSvc.conversations();
    }

    return this.msgSvc.conversations().filter(conv => {
      const contact =
        conv.participants.find(p => p !== this.msgSvc.me()) ?? '';

      return contact.toLowerCase().includes(q);
    });
  });

  // ── Sélection conversation ────────────────────────────────
  selectConv(id: string): void {
    this.msgSvc.selectConversation(id);
    this.draftText = '';
    this.shouldScrollBottom = true;
  }

  // ── Envoyer message ───────────────────────────────────────
  send(): void {
    if (!this.draftText.trim()) {
      return;
    }

    this.msgSvc.sendMessage(this.draftText);

    this.draftText = '';
    this.shouldScrollBottom = true;

    this._showTyping();

    if (this.msgInputRef) {
      this.msgInputRef.nativeElement.style.height = 'auto';
    }
  }

  // ── Entrée pour envoyer ───────────────────────────────────
  onEnter(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  // ── Dernier message d'un groupe ───────────────────────────
  isLastInGroup(
    messages: ChatMessage[],
    current: ChatMessage
  ): boolean {
    const idx = messages.indexOf(current);

    if (idx === messages.length - 1) {
      return true;
    }

    return messages[idx + 1].from !== current.from;
  }

  // ── Contact de la conversation ────────────────────────────
  getContactName(participants: [string, string]): string {
    return participants.find(
      p => p !== this.msgSvc.me()
    ) ?? '';
  }

  // ── Typing indicator ──────────────────────────────────────
  private _showTyping(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    this.isTyping.set(true);

    this.typingTimer = setTimeout(() => {
      this.isTyping.set(false);
    }, 4000);
  }

  // ── Scroll automatique ────────────────────────────────────
  ngAfterViewChecked(): void {
    if (this.shouldScrollBottom && this.chatBodyRef) {
      const el = this.chatBodyRef.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScrollBottom = false;
    }
  }
}