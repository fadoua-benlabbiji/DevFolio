// message.ts
import { Injectable, signal, computed } from '@angular/core';

// ─── Types ───────────────────────────────────────────────────

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: number;   // 0 = moi
  text: string;
  sentAt: string;     // ISO string
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  contactId: number;
  contactName: string;
  contactAvatar: string;
  contactTitle: string;
  isOnline: boolean;
  lastSeen?: string;
  messages: ChatMessage[];
}

// ─── Service ─────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class MessageService {

  readonly conversations = signal<Conversation[]>([
    {
      id: 'conv-1',
      contactId: 101,
      contactName: 'Karim Ziani',
      contactAvatar: 'https://i.pravatar.cc/40?img=12',
      contactTitle: 'Recruteur @ startup.io',
      isOnline: true,
      messages: [
        {
          id: 'm1', conversationId: 'conv-1', senderId: 101,
          text: 'Bonjour Lina, nous cherchons une dev React pour un projet de 3 mois. Êtes-vous disponible ?',
          sentAt: '2026-05-28T09:00:00Z', status: 'read'
        },
        {
          id: 'm2', conversationId: 'conv-1', senderId: 1,
          text: 'Bonjour Karim ! Oui je suis disponible, pouvez-vous me donner plus de détails sur le projet ?',
          sentAt: '2026-05-28T09:15:00Z', status: 'read'
        },
        {
          id: 'm3', conversationId: 'conv-1', senderId: 101,
          text: 'Bien sûr ! C\'est une app e-commerce en React + Node.js. Début mi-juin.',
          sentAt: '2026-05-28T09:20:00Z', status: 'read'
        },
        {
          id: 'm4', conversationId: 'conv-1', senderId: 1,
          text: 'Ça me convient, je suis dispo à partir du 10 juin. On peut prévoir un appel cette semaine ?',
          sentAt: '2026-05-28T09:30:00Z', status: 'read'
        },
        {
          id: 'm5', conversationId: 'conv-1', senderId: 101,
          text: 'Parfait ! Jeudi à 14h vous convient ?',
          sentAt: '2026-05-28T10:00:00Z', status: 'read'
        },
        {
          id: 'm6', conversationId: 'conv-1', senderId: 1,
          text: 'Jeudi 14h c\'est noté 👍',
          sentAt: '2026-05-28T10:05:00Z', status: 'delivered'
        },
      ]
    },
    {
      id: 'conv-2',
      contactId: 102,
      contactName: 'Sophie Martin',
      contactAvatar: 'https://i.pravatar.cc/40?img=5',
      contactTitle: 'Designer UI/UX @ Studio M',
      isOnline: false,
      lastSeen: 'il y a 3h',
      messages: [
        {
          id: 'm7', conversationId: 'conv-2', senderId: 102,
          text: 'J\'adore ton portfolio ! On pourrait travailler ensemble sur un projet ?',
          sentAt: '2026-05-25T11:00:00Z', status: 'read'
        },
        {
          id: 'm8', conversationId: 'conv-2', senderId: 1,
          text: 'Merci Sophie ! Avec plaisir, tu as quelque chose en tête ?',
          sentAt: '2026-05-25T11:30:00Z', status: 'read'
        },
        {
          id: 'm9', conversationId: 'conv-2', senderId: 102,
          text: 'Oui, j\'ai un client qui cherche une app web avec un design soigné. Je gère le design, toi le dev ?',
          sentAt: '2026-05-25T11:45:00Z', status: 'read'
        },
        {
          id: 'm10', conversationId: 'conv-2', senderId: 1,
          text: 'Ça sonne bien ! Envoie-moi le brief quand tu l\'as.',
          sentAt: '2026-05-25T12:00:00Z', status: 'sent'
        },
      ]
    },
    {
      id: 'conv-3',
      contactId: 103,
      contactName: 'Ahmed Fassi',
      contactAvatar: 'https://i.pravatar.cc/40?img=11',
      contactTitle: 'CTO @ StartupMA',
      isOnline: false,
      lastSeen: 'Hier',
      messages: [
        {
          id: 'm11', conversationId: 'conv-3', senderId: 103,
          text: 'Bonjour, votre profil m\'a été recommandé pour un poste de lead dev.',
          sentAt: '2026-06-03T11:00:00Z', status: 'read'
        },
        {
          id: 'm12', conversationId: 'conv-3', senderId: 1,
          text: 'Bonjour Ahmed ! Je suis ouvert à en discuter, quel est le stack prévu ?',
          sentAt: '2026-06-03T14:00:00Z', status: 'sent'
        },
      ]
    },
  ]);

  // ── Conversation sélectionnée ──
  readonly selectedId = signal<string | null>('conv-1');

  readonly selectedConversation = computed(() => {
    const id = this.selectedId();
    return this.conversations().find(c => c.id === id) ?? null;
  });

  // ── Non lus total ──
  readonly unreadCount = computed(() =>
    this.conversations().reduce((acc, conv) => {
      return acc + conv.messages.filter(m => m.senderId !== 0 && m.status !== 'read').length;
    }, 0)
  );

  // ── Dernier message ──
  lastMessage(conv: Conversation): ChatMessage | null {
    return conv.messages.length ? conv.messages[conv.messages.length - 1] : null;
  }

  // ── Non lus par conv ──
  unreadInConv(conv: Conversation): number {
    return conv.messages.filter(m => m.senderId !== 0 && m.status !== 'read').length;
  }

  // ── Sélectionner + marquer comme lu ──
  selectConversation(id: string): void {
    this.selectedId.set(id);
    this.conversations.update(list =>
      list.map(conv =>
        conv.id === id
          ? {
              ...conv,
              messages: conv.messages.map(m =>
                m.senderId !== 0 ? { ...m, status: 'read' as MessageStatus } : m
              )
            }
          : conv
      )
    );
  }

  // ── Envoyer un message ──
  sendMessage(conversationId: string, text: string, myId: number): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(36),
      conversationId,
      senderId: myId,
      text: trimmed,
      sentAt: new Date().toISOString(),
      status: 'sending'
    };

    this.conversations.update(list =>
      list.map(conv =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, newMsg] }
          : conv
      )
    );

    // Progression statut
    setTimeout(() => this._updateStatus(conversationId, newMsg.id, 'sent'),      500);
    setTimeout(() => this._updateStatus(conversationId, newMsg.id, 'delivered'), 1500);

    // Réponse simulée après 3-5s
    const delay = 3000 + Math.random() * 2000;
    setTimeout(() => this._simulateReply(conversationId), delay);
  }

  private _updateStatus(convId: string, msgId: string, status: MessageStatus): void {
    this.conversations.update(list =>
      list.map(conv =>
        conv.id === convId
          ? {
              ...conv,
              messages: conv.messages.map(m =>
                m.id === msgId ? { ...m, status } : m
              )
            }
          : conv
      )
    );
  }

  private _simulateReply(conversationId: string): void {
    const replies = [
      'Super, merci pour l\'info !',
      'D\'accord, on fait comme ça 👌',
      'Parfait, je te tiens au courant.',
      'Reçu ! Je regarde ça rapidement.',
      'Ok, sounds good !',
      'Bien noté, merci !',
      'Je reviens vers toi demain.',
    ];
    const conv = this.conversations().find(c => c.id === conversationId);
    if (!conv) return;

    const reply: ChatMessage = {
      id: Date.now().toString(36) + 'r',
      conversationId,
      senderId: conv.contactId,
      text: replies[Math.floor(Math.random() * replies.length)],
      sentAt: new Date().toISOString(),
      status: this.selectedId() === conversationId ? 'read' : 'delivered'
    };

    this.conversations.update(list =>
      list.map(c =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, reply] }
          : c
      )
    );
  }

  // ── Formatage heure ──
  formatTime(isoString: string): string {
    const d = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7)  return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }

  // ── Formatage date séparateur ──
  formatDateSeparator(isoString: string): string {
    const d = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  // ── Grouper par date ──
  groupByDate(messages: ChatMessage[]): { date: string; messages: ChatMessage[] }[] {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let lastDate = '';
    for (const msg of messages) {
      const dateKey = new Date(msg.sentAt).toDateString();
      if (dateKey !== lastDate) {
        groups.push({ date: msg.sentAt, messages: [msg] });
        lastDate = dateKey;
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  }
}