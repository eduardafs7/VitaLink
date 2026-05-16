const { DomainError } = require('./errors');
const { AppointmentStatus } = require('./enums');
const { asDate, required } = require('./utils');

const CANCEL_DEADLINE_HOURS = 24;

class Appointment {
  constructor({
    id,
    patientId,
    specialty,
    doctorName,
    dateTime,
    status = AppointmentStatus.PENDING_CONFIRMATION,
    requestedByUserId = null,
    confirmedByUserId = null,
    cancelledByUserId = null,
    cancelledAt = null,
    createdAt = new Date(),
  }) {
    this.id = required(id, 'ID da consulta');
    this.patientId = required(patientId, 'ID do paciente');
    this.specialty = required(specialty, 'Especialidade');
    this.doctorName = required(doctorName, 'Médico responsável');
    this.dateTime = asDate(dateTime, 'Data e hora da consulta');
    this.status = required(status, 'Status da consulta');
    this.requestedByUserId = requestedByUserId;
    this.confirmedByUserId = confirmedByUserId;
    this.cancelledByUserId = cancelledByUserId;
    this.cancelledAt = cancelledAt ? asDate(cancelledAt, 'Data de cancelamento') : null;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);

    if (!Object.values(AppointmentStatus).includes(this.status)) {
      throw new DomainError('Status da consulta inválido');
    }
  }

  confirm(userId) {
    this.confirmedByUserId = required(userId, 'Usuário responsável pela confirmação');
    this.status = AppointmentStatus.CONFIRMED;
  }

  cancel(userId, now = new Date()) {
    const diffInMs = this.dateTime.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < CANCEL_DEADLINE_HOURS) {
      throw new DomainError('Prazo para cancelamento encerrado. Entre em contato com a clínica.');
    }

    this.status = AppointmentStatus.CANCELLED;
    this.cancelledByUserId = required(userId, 'Usuário responsável pelo cancelamento');
    this.cancelledAt = now;
  }
}

module.exports = {
  Appointment,
  CANCEL_DEADLINE_HOURS,
};
