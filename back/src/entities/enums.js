const UserRole = Object.freeze({
  ADMIN: 'ADMIN',
  ATTENDANT: 'ATTENDANT',
  FAMILY: 'FAMILY',
});

const AppointmentStatus = Object.freeze({
  PENDING_CONFIRMATION: 'Aguardando confirmação',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelada',
});

const ExamStatus = Object.freeze({
  WAITING_RELEASE: 'Aguardando liberação',
  RELEASED: 'Liberado',
});

const NotificationType = Object.freeze({
  APPOINTMENT_REQUESTED: 'APPOINTMENT_REQUESTED',
  APPOINTMENT_CONFIRMED: 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
  EXAM_RELEASED: 'EXAM_RELEASED',
  FAMILY_LINKED: 'FAMILY_LINKED',
});

const ActionType = Object.freeze({
  APPOINTMENT_REQUESTED: 'APPOINTMENT_REQUESTED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  EXAM_VIEWED: 'EXAM_VIEWED',
  DASHBOARD_ACCESSED: 'DASHBOARD_ACCESSED',
});

module.exports = {
  ActionType,
  AppointmentStatus,
  ExamStatus,
  NotificationType,
  UserRole,
};
