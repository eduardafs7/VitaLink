const { DomainError } = require('./errors');
const { ActionType } = require('./enums');
const { required } = require('./utils');

class ActionLog {
  constructor({ id, patientId, familyUserId, type, occurredAt = new Date(), metadata = {} }) {
    this.id = required(id, 'ID do histórico');
    this.patientId = required(patientId, 'ID do paciente');
    this.familyUserId = required(familyUserId, 'Familiar responsável');
    this.type = required(type, 'Tipo de ação');
    this.occurredAt = occurredAt instanceof Date ? occurredAt : new Date(occurredAt);
    this.metadata = { ...metadata };

    if (!Object.values(ActionType).includes(this.type)) {
      throw new DomainError('Tipo de ação inválido');
    }
  }
}

module.exports = {
  ActionLog,
};
