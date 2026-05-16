const { ExamStatus } = require('./enums');
const { asDate, required } = require('./utils');

class ExamResult {
  constructor({
    id,
    patientId,
    name,
    fileUrl,
    status = ExamStatus.WAITING_RELEASE,
    releasedAt = null,
    releasedByUserId = null,
    viewedByUserIds = [],
    createdAt = new Date(),
  }) {
    this.id = required(id, 'ID do exame');
    this.patientId = required(patientId, 'ID do paciente');
    this.name = required(name, 'Nome do exame');
    this.fileUrl = required(fileUrl, 'Arquivo do exame');
    this.status = required(status, 'Status do exame');
    this.releasedAt = releasedAt ? asDate(releasedAt, 'Data de liberação') : null;
    this.releasedByUserId = releasedByUserId;
    this.viewedByUserIds = [...new Set(viewedByUserIds)];
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }

  release(userId, now = new Date()) {
    this.status = ExamStatus.RELEASED;
    this.releasedByUserId = required(userId, 'Usuário responsável pela liberação');
    this.releasedAt = now;
  }

  isVisibleToFamily() {
    return this.status === ExamStatus.RELEASED;
  }

  markViewedBy(userId) {
    required(userId, 'Usuário familiar');

    if (!this.viewedByUserIds.includes(userId)) {
      this.viewedByUserIds.push(userId);
    }
  }
}

module.exports = {
  ExamResult,
};
