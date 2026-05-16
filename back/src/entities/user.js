const { DomainError } = require('./errors');
const { UserRole } = require('./enums');
const { normalizeEmail, required } = require('./utils');

class User {
  constructor({ id, name, email, passwordHash, role, active = true }) {
    this.id = required(id, 'ID do usuário');
    this.name = required(name, 'Nome do usuário');
    this.email = normalizeEmail(email);
    this.passwordHash = required(passwordHash, 'Senha');
    this.role = required(role, 'Perfil de acesso');
    this.active = Boolean(active);

    if (!Object.values(UserRole).includes(this.role)) {
      throw new DomainError('Perfil de acesso inválido');
    }
  }

  deactivate() {
    this.active = false;
  }

  activate() {
    this.active = true;
  }

  canAccessPatient(patientId) {
    if (this.role !== UserRole.FAMILY) {
      return true;
    }

    return this.patientIds?.includes(patientId) || false;
  }
}

class FamilyUser extends User {
  constructor({ patientIds = [], ...props }) {
    super({ ...props, role: UserRole.FAMILY });
    this.patientIds = [...new Set(patientIds)];
  }

  linkPatient(patientId) {
    required(patientId, 'ID do paciente');

    if (!this.patientIds.includes(patientId)) {
      this.patientIds.push(patientId);
    }
  }
}

module.exports = {
  FamilyUser,
  User,
};
