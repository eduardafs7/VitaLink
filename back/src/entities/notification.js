const { DomainError } = require('./errors');
const { NotificationType } = require('./enums');
const { required } = require('./utils');

class Notification {
  constructor({
    id,
    recipientUserId,
    type,
    title,
    message,
    readAt = null,
    sentAt = new Date(),
    metadata = {},
  }) {
    this.id = required(id, 'ID da notificação');
    this.recipientUserId = required(recipientUserId, 'Destinatário');
    this.type = required(type, 'Tipo da notificação');
    this.title = required(title, 'Título da notificação');
    this.message = required(message, 'Mensagem da notificação');
    this.readAt = readAt ? new Date(readAt) : null;
    this.sentAt = sentAt instanceof Date ? sentAt : new Date(sentAt);
    this.metadata = { ...metadata };

    if (!Object.values(NotificationType).includes(this.type)) {
      throw new DomainError('Tipo de notificação inválido');
    }
  }

  markAsRead(now = new Date()) {
    this.readAt = now;
  }
}

module.exports = {
  Notification,
};
