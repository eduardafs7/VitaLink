const {
  Appointment,
  AppointmentStatus,
  ExamResult,
  ExamStatus,
  FamilyMember,
  FamilyUser,
  Notification,
  NotificationType,
  Patient,
  User,
  UserRole,
} = require('../entities');

function addDays(days, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function seedStore(store) {
  if (store.list('patients').length > 0) {
    return;
  }

  const patients = [
    new Patient({
      id: 'pat_maria',
      name: 'Maria Oliveira',
      cpf: '12345678901',
      birthDate: '1948-05-10',
      contact: '(11) 98888-0101',
      familyMembers: [
        new FamilyMember({
          id: 'fam_ana',
          name: 'Ana Oliveira',
          cpf: '11122233344',
          relationship: 'Filha',
          email: 'ana.familia@example.com',
        }),
      ],
    }),
    new Patient({
      id: 'pat_joao',
      name: 'João Pereira',
      cpf: '98765432100',
      birthDate: '1952-09-22',
      contact: '(21) 97777-0202',
      familyMembers: [
        new FamilyMember({
          id: 'fam_carlos',
          name: 'Carlos Pereira',
          cpf: '55566677788',
          relationship: 'Neto',
          email: 'carlos.familia@example.com',
        }),
      ],
    }),
  ];

  const users = [
    new User({
      id: 'usr_admin',
      name: 'Marina Souza',
      email: 'admin@clinica.com',
      passwordHash: 'admin123',
      role: UserRole.ADMIN,
    }),
    new User({
      id: 'usr_atendente',
      name: 'Paula Mendes',
      email: 'atendente@clinica.com',
      passwordHash: 'atendente123',
      role: UserRole.ATTENDANT,
    }),
    new FamilyUser({
      id: 'usr_ana',
      name: 'Ana Oliveira',
      email: 'ana.familia@example.com',
      passwordHash: 'familia123',
      patientIds: ['pat_maria'],
    }),
    new FamilyUser({
      id: 'usr_carlos',
      name: 'Carlos Pereira',
      email: 'carlos.familia@example.com',
      passwordHash: 'familia123',
      patientIds: ['pat_joao'],
    }),
  ];

  const appointments = [
    new Appointment({
      id: 'app_cardio_maria',
      patientId: 'pat_maria',
      specialty: 'Cardiologia',
      doctorName: 'Dra. Helena Costa',
      dateTime: addDays(5, 10, 30),
      status: AppointmentStatus.CONFIRMED,
      requestedByUserId: 'usr_ana',
      confirmedByUserId: 'usr_atendente',
    }),
    new Appointment({
      id: 'app_geriatria_maria',
      patientId: 'pat_maria',
      specialty: 'Geriatria',
      doctorName: 'Dr. Roberto Lima',
      dateTime: addDays(12, 14, 0),
      requestedByUserId: 'usr_ana',
    }),
    new Appointment({
      id: 'app_neuro_joao',
      patientId: 'pat_joao',
      specialty: 'Neurologia',
      doctorName: 'Dra. Fernanda Rocha',
      dateTime: addDays(8, 9, 0),
      status: AppointmentStatus.CONFIRMED,
      requestedByUserId: 'usr_carlos',
      confirmedByUserId: 'usr_atendente',
    }),
  ];

  const exams = [
    new ExamResult({
      id: 'exa_hemograma_maria',
      patientId: 'pat_maria',
      name: 'Hemograma completo',
      fileUrl: 'https://example.com/exames/hemograma-maria.pdf',
      status: ExamStatus.RELEASED,
      releasedAt: addDays(-1, 16, 15),
      releasedByUserId: 'usr_atendente',
    }),
    new ExamResult({
      id: 'exa_glicemia_maria',
      patientId: 'pat_maria',
      name: 'Glicemia de jejum',
      fileUrl: 'https://example.com/exames/glicemia-maria.pdf',
    }),
    new ExamResult({
      id: 'exa_colesterol_joao',
      patientId: 'pat_joao',
      name: 'Perfil lipídico',
      fileUrl: 'https://example.com/exames/colesterol-joao.pdf',
      status: ExamStatus.RELEASED,
      releasedAt: addDays(-2, 11, 20),
      releasedByUserId: 'usr_atendente',
    }),
  ];

  const notifications = [
    new Notification({
      id: 'not_consulta_maria',
      recipientUserId: 'usr_ana',
      type: NotificationType.APPOINTMENT_REMINDER,
      title: 'Consulta próxima',
      message: 'Maria Oliveira tem consulta de Cardiologia agendada.',
      sentAt: addDays(-1, 8, 30),
      metadata: { appointmentId: 'app_cardio_maria' },
    }),
    new Notification({
      id: 'not_exame_maria',
      recipientUserId: 'usr_ana',
      type: NotificationType.EXAM_RELEASED,
      title: 'Exame liberado',
      message: 'O resultado de Hemograma completo já está disponível.',
      sentAt: addDays(-1, 16, 30),
      metadata: { examId: 'exa_hemograma_maria' },
    }),
    new Notification({
      id: 'not_exame_joao',
      recipientUserId: 'usr_carlos',
      type: NotificationType.EXAM_RELEASED,
      title: 'Resultado disponível',
      message: 'O exame Perfil lipídico de João Pereira foi liberado.',
      sentAt: addDays(-2, 11, 40),
      metadata: { examId: 'exa_colesterol_joao' },
    }),
  ];

  patients.forEach((patient) => store.create('patients', patient));
  users.forEach((user) => store.create('users', user));
  appointments.forEach((appointment) => store.create('appointments', appointment));
  exams.forEach((exam) => store.create('exams', exam));
  notifications.forEach((notification) => store.create('notifications', notification));
}

module.exports = {
  seedStore,
};
