const { DomainError } = require('./errors');
const { Patient } = require('./patient');

class ClinicRegistry {
  constructor({ patients = [] } = {}) {
    this.patients = patients.map((patient) =>
      patient instanceof Patient ? patient : new Patient(patient)
    );
  }

  registerPatient(patient) {
    const newPatient = patient instanceof Patient ? patient : new Patient(patient);

    if (this.patients.some((currentPatient) => currentPatient.cpf === newPatient.cpf)) {
      throw new DomainError('CPF já cadastrado');
    }

    this.patients.push(newPatient);
    return newPatient;
  }

  findPatientById(patientId) {
    return this.patients.find((patient) => patient.id === patientId) || null;
  }

  listPatients() {
    return [...this.patients];
  }
}

module.exports = {
  ClinicRegistry,
};
