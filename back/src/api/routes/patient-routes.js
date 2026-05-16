const {
  AppointmentStatus,
  ClinicRegistry,
  DomainError,
  FamilyMember,
  Patient,
} = require('../../entities');
const { notFound, sendJson, sendNoContent, serialize } = require('../http-utils');

function registerPatientRoutes(store, addRoute) {
  addRoute('GET', '/patients', async (_ctx, res) => {
    sendJson(res, 200, store.list('patients').map(serialize));
  });

  addRoute('POST', '/patients', async ({ body }, res) => {
    const registry = new ClinicRegistry({ patients: store.list('patients') });
    const patient = new Patient({ id: body.id || store.nextId('pat'), ...body });
    registry.registerPatient(patient);
    store.create('patients', patient);
    sendJson(res, 201, serialize(patient));
  });

  addRoute('GET', '/patients/:id', async ({ params }, res) => {
    const patient = store.find('patients', params.id);

    if (!patient) {
      notFound(res, 'Paciente');
      return;
    }

    sendJson(res, 200, serialize(patient));
  });

  addRoute('PUT', '/patients/:id', async ({ params, body }, res) => {
    const existing = store.find('patients', params.id);

    if (!existing) {
      notFound(res, 'Paciente');
      return;
    }

    const updated = new Patient({
      ...existing,
      ...body,
      id: params.id,
      familyMembers: body.familyMembers || existing.familyMembers,
      appointments: body.appointments || existing.appointments,
      exams: body.exams || existing.exams,
      actionLogs: body.actionLogs || existing.actionLogs,
    });

    const duplicateCpf = store
      .list('patients')
      .some((patient) => patient.id !== params.id && patient.cpf === updated.cpf);

    if (duplicateCpf) {
      throw new DomainError('CPF jÃ¡ cadastrado');
    }

    store.update('patients', params.id, () => updated);
    sendJson(res, 200, serialize(updated));
  });

  addRoute('DELETE', '/patients/:id', async ({ params }, res) => {
    if (!store.delete('patients', params.id)) {
      notFound(res, 'Paciente');
      return;
    }

    sendNoContent(res);
  });

  addRoute('GET', '/patients/:patientId/family-members', async ({ params }, res) => {
    const patient = findPatient(store, params.patientId, res);
    if (!patient) return;

    sendJson(res, 200, patient.familyMembers.map(serialize));
  });

  addRoute('GET', '/patients/:patientId/family-members/:familyMemberId', async ({ params }, res) => {
    const patient = findPatient(store, params.patientId, res);
    if (!patient) return;

    const member = patient.familyMembers.find(
      (familyMember) => familyMember.id === params.familyMemberId
    );

    if (!member) {
      notFound(res, 'Familiar');
      return;
    }

    sendJson(res, 200, serialize(member));
  });

  addRoute('POST', '/patients/:patientId/family-members', async ({ params, body }, res) => {
    const patient = findPatient(store, params.patientId, res);
    if (!patient) return;

    const member = new FamilyMember({ id: body.id || store.nextId('fam'), ...body });
    patient.linkFamilyMember(member);
    sendJson(res, 201, serialize(member));
  });

  addRoute('PUT', '/patients/:patientId/family-members/:familyMemberId', async ({ params, body }, res) => {
    const patient = findPatient(store, params.patientId, res);
    if (!patient) return;

    const index = patient.familyMembers.findIndex((member) => member.id === params.familyMemberId);

    if (index === -1) {
      notFound(res, 'Familiar');
      return;
    }

    const updated = new FamilyMember({
      ...patient.familyMembers[index],
      ...body,
      id: params.familyMemberId,
    });
    const duplicateCpf = patient.familyMembers.some(
      (member) => member.id !== params.familyMemberId && member.cpf === updated.cpf
    );

    if (duplicateCpf) {
      throw new DomainError('Familiar jÃ¡ vinculado ao paciente');
    }

    patient.familyMembers[index] = updated;
    sendJson(res, 200, serialize(updated));
  });

  addRoute('DELETE', '/patients/:patientId/family-members/:familyMemberId', async ({ params }, res) => {
    const patient = findPatient(store, params.patientId, res);
    if (!patient) return;

    const index = patient.familyMembers.findIndex((member) => member.id === params.familyMemberId);

    if (index === -1) {
      notFound(res, 'Familiar');
      return;
    }

    patient.familyMembers.splice(index, 1);
    sendNoContent(res);
  });

  addRoute('GET', '/patients/:patientId/dashboard/:familyUserId', async ({ params }, res) => {
    const patient = findPatient(store, params.patientId, res);
    if (!patient) return;

    const now = new Date();
    const nextAppointment = store
      .list('appointments')
      .filter(
        (appointment) =>
          appointment.patientId === params.patientId &&
          appointment.status === AppointmentStatus.CONFIRMED &&
          appointment.dateTime > now
      )
      .sort((left, right) => left.dateTime - right.dateTime)[0] || null;
    const unreadReleasedExams = store
      .list('exams')
      .filter(
        (exam) =>
          exam.patientId === params.patientId &&
          exam.isVisibleToFamily() &&
          !exam.viewedByUserIds.includes(params.familyUserId)
      ).length;
    const recentNotifications = store
      .list('notifications')
      .filter((notification) => notification.recipientUserId === params.familyUserId)
      .sort((left, right) => right.sentAt - left.sentAt)
      .slice(0, 3);

    if (!nextAppointment && unreadReleasedExams === 0 && recentNotifications.length === 0) {
      sendJson(res, 200, { message: 'Nenhuma informaÃ§Ã£o disponÃ­vel no momento' });
      return;
    }

    sendJson(res, 200, {
      nextAppointment: nextAppointment ? serialize(nextAppointment) : null,
      unreadReleasedExams,
      recentNotifications: recentNotifications.map(serialize),
    });
  });
}

function findPatient(store, patientId, res) {
  const patient = store.find('patients', patientId);

  if (!patient) {
    notFound(res, 'Paciente');
    return null;
  }

  return patient;
}

module.exports = {
  registerPatientRoutes,
};
