const { DomainError } = require('./errors');
const { FamilyMember } = require('./family-member');
const { asDate, normalizeCpf, required } = require('./utils');

const MAX_FAMILY_MEMBERS = 5;

class Patient {
  constructor({
    id,
    name,
    cpf,
    birthDate,
    contact,
    familyMembers = [],
    appointments = [],
    exams = [],
    actionLogs = [],
    createdAt = new Date(),
  }) {
    this.id = required(id, 'ID do paciente');
    this.name = required(name, 'Nome do paciente');
    this.cpf = normalizeCpf(cpf);
    this.birthDate = asDate(birthDate, 'Data de nascimento');
    this.contact = required(contact, 'Contato do paciente');
    this.familyMembers = familyMembers.map((familyMember) =>
      familyMember instanceof FamilyMember ? familyMember : new FamilyMember(familyMember)
    );
    this.appointments = [...appointments];
    this.exams = [...exams];
    this.actionLogs = [...actionLogs];
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);

    if (this.familyMembers.length > MAX_FAMILY_MEMBERS) {
      throw new DomainError('Limite de familiares atingido');
    }
  }

  linkFamilyMember(familyMember) {
    if (this.familyMembers.length >= MAX_FAMILY_MEMBERS) {
      throw new DomainError('Limite de familiares atingido');
    }

    const member =
      familyMember instanceof FamilyMember ? familyMember : new FamilyMember(familyMember);

    if (this.familyMembers.some((currentMember) => currentMember.cpf === member.cpf)) {
      throw new DomainError('Familiar já vinculado ao paciente');
    }

    this.familyMembers.push(member);
    return member;
  }

  addAppointment(appointment) {
    this.appointments.push(appointment);
    return appointment;
  }

  addExam(exam) {
    this.exams.push(exam);
    return exam;
  }

  addActionLog(actionLog) {
    this.actionLogs.push(actionLog);
    return actionLog;
  }

  upcomingAppointments(now = new Date()) {
    return this.appointments.filter((appointment) => appointment.dateTime > now);
  }
}

module.exports = {
  MAX_FAMILY_MEMBERS,
  Patient,
};
