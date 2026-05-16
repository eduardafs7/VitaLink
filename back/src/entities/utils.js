const { DomainError } = require('./errors');

function required(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new DomainError(`${fieldName} é obrigatório`);
  }

  return value;
}

function normalizeCpf(cpf) {
  required(cpf, 'CPF');
  const digits = String(cpf).replace(/\D/g, '');

  if (digits.length !== 11) {
    throw new DomainError('CPF inválido');
  }

  return digits;
}

function normalizeEmail(email) {
  required(email, 'E-mail');
  const normalized = String(email).trim().toLowerCase();

  if (!normalized.includes('@')) {
    throw new DomainError('E-mail inválido');
  }

  return normalized;
}

function asDate(value, fieldName) {
  required(value, fieldName);
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(`${fieldName} inválida`);
  }

  return date;
}

module.exports = {
  asDate,
  normalizeCpf,
  normalizeEmail,
  required,
};
