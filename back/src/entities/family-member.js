const { normalizeCpf, normalizeEmail, required } = require('./utils');

class FamilyMember {
  constructor({ id, name, cpf, relationship, email, userId = null, linkedAt = new Date() }) {
    this.id = required(id, 'ID do familiar');
    this.name = required(name, 'Nome do familiar');
    this.cpf = normalizeCpf(cpf);
    this.relationship = required(relationship, 'Grau de parentesco');
    this.email = email ? normalizeEmail(email) : null;
    this.userId = userId;
    this.linkedAt = linkedAt instanceof Date ? linkedAt : new Date(linkedAt);
  }
}

module.exports = {
  FamilyMember,
};
