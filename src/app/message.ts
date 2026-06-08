import { Injectable, signal, computed } from '@angular/core';

export interface ChatMessage {
  id: string;
  from: string;   // nom de l'expéditeur
  to: string;     // nom du destinataire
  text: string;
  sentAt: string;
}

export interface Conversation {
  id: string;
  participants: [string, string];  // [personne A, personne B]
  messages: ChatMessage[];
}

@Injectable({ providedIn: 'root' })
export class MessageService {

  readonly me = signal<string>('Lina');  // utilisateur connecté

  readonly conversations = signal<Conversation[]>([
    {
      id: 'conv-1',
      participants: ['Lina', 'Karim'],
      messages: [
        { id: 'm1', from: 'Karim', to: 'Lina',  text: 'Bonjour Lina, nous cherchons une dev React pour un projet de 3 mois. Êtes-vous disponible ?', sentAt: '2026-05-28T09:00:00Z' },
        { id: 'm2', from: 'Lina',  to: 'Karim', text: 'Bonjour Karim ! Oui je suis disponible, pouvez-vous me donner plus de détails ?',             sentAt: '2026-05-28T09:15:00Z' },
        { id: 'm3', from: 'Karim', to: 'Lina',  text: 'C\'est une app e-commerce en React + Node.js. Début mi-juin.',                                  sentAt: '2026-05-28T09:20:00Z' },
        { id: 'm4', from: 'Lina',  to: 'Karim', text: 'Ça me convient, je suis dispo à partir du 10 juin.',                                            sentAt: '2026-05-28T09:30:00Z' },
        { id: 'm5', from: 'Karim', to: 'Lina',  text: 'Parfait ! Jeudi à 14h vous convient ?',                                                          sentAt: '2026-05-28T10:00:00Z' },
        { id: 'm6', from: 'Lina',  to: 'Karim', text: 'Jeudi 14h c\'est noté !',                                                                        sentAt: '2026-05-28T10:05:00Z' },
      ].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
    },
    {
      id: 'conv-2',
      participants: ['Lina', 'Sophie'],
      messages: [
        { id: 'm7', from: 'Sophie', to: 'Lina',   text: 'J\'adore ton portfolio ! On pourrait travailler ensemble ?', sentAt: '2026-05-25T11:00:00Z' },
        { id: 'm8', from: 'Lina',   to: 'Sophie', text: 'Merci Sophie ! Avec plaisir, tu as quelque chose en tête ?', sentAt: '2026-05-25T11:30:00Z' },
        { id: 'm9', from: 'Sophie', to: 'Lina',   text: 'Oui, une app web. Je gère le design, toi le dev ?',          sentAt: '2026-05-25T11:45:00Z' },
        { id: 'm10', from: 'Lina',  to: 'Sophie', text: 'Envoie-moi le brief quand tu l\'as.',                         sentAt: '2026-05-25T12:00:00Z' },
      ].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
    },
    {
      id: 'conv-3',
      participants: ['Lina', 'Ahmed'],
      messages: [
        { id: 'm11', from: 'Ahmed', to: 'Lina',  text: 'Bonjour, votre profil m\'a été recommandé pour un poste de lead dev.', sentAt: '2026-06-03T11:00:00Z' },
        { id: 'm12', from: 'Lina',  to: 'Ahmed', text: 'Bonjour Ahmed ! Je suis ouvert à en discuter, quel est le stack ?',    sentAt: '2026-06-03T14:00:00Z' },
      ].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
    },
  ]);

  readonly selectedId = signal<string>('conv-1');

  readonly selectedConversation = computed(() =>
    this.conversations().find(c => c.id === this.selectedId()) ?? null
  );

  // contact de la conversation sélectionnée
  readonly contactName = computed(() => {
    const conv = this.selectedConversation();
    if (!conv) return '';
    return conv.participants.find(p => p !== this.me()) ?? '';
  });

  selectConversation(id: string): void {
    this.selectedId.set(id);
  }

  sendMessage(text: string): void {
    const convId = this.selectedId();
    const conv = this.conversations().find(c => c.id === convId);
    if (!conv || !text.trim()) return;

    const contact = conv.participants.find(p => p !== this.me()) ?? '';
    const newMsg: ChatMessage = {
      id: Date.now().toString(36),
      from: this.me(),
      to: contact,
      text: text.trim(),
      sentAt: new Date().toISOString(),
    };

    this.conversations.update(list =>
      list.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, newMsg].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()) }
          : c
      )
    );
  }

  lastMessage(conv: Conversation): ChatMessage | null {
    return conv.messages.length ? conv.messages[conv.messages.length - 1] : null;
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}