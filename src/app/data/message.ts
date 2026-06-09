/**
 * message.ts — MessageService supprimé
 *
 * Les messages sont maintenant gérés directement par PortfolioService :
 *   - portfolioSvc.receivedMessages  → messages reçus
 *   - portfolioSvc.sentMessages      → messages envoyés
 *   - portfolioSvc.unreadCount       → compteur non lus
 *   - portfolioSvc.markAsRead(id)
 *   - portfolioSvc.deleteMessage(id)
 *   - portfolioSvc.sendMessage(...)
 */
export {};
