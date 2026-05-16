# VitaLink API

API HTTP em Node.js puro para cadastro de pacientes, familiares, usuários, consultas, exames, notificações e histórico.

## Rodar

```bash
npm start
```

Servidor padrão: `http://localhost:3000`

## Endpoints

### Saúde

- `GET /health`

### Pacientes

- `GET /patients`
- `POST /patients`
- `GET /patients/:id`
- `PUT /patients/:id`
- `DELETE /patients/:id`

Campos principais:

```json
{
  "name": "Maria Silva",
  "cpf": "12345678901",
  "birthDate": "1980-05-10",
  "contact": "11999999999"
}
```

### Familiares do paciente

- `GET /patients/:patientId/family-members`
- `POST /patients/:patientId/family-members`
- `GET /patients/:patientId/family-members/:familyMemberId`
- `PUT /patients/:patientId/family-members/:familyMemberId`
- `DELETE /patients/:patientId/family-members/:familyMemberId`

Campos principais:

```json
{
  "name": "Joao Silva",
  "cpf": "00000000001",
  "relationship": "Filho",
  "email": "joao@example.com"
}
```

### Usuários

- `GET /users`
- `POST /users`
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`

Perfis aceitos: `ADMIN`, `ATTENDANT`, `FAMILY`.

### Consultas

- `GET /appointments`
- `POST /appointments`
- `GET /appointments/:id`
- `PUT /appointments/:id`
- `DELETE /appointments/:id`
- `PATCH /appointments/:id/confirm`
- `PATCH /appointments/:id/cancel`

### Exames

- `GET /exams`
- `POST /exams`
- `GET /exams/:id`
- `PUT /exams/:id`
- `DELETE /exams/:id`
- `PATCH /exams/:id/release`

### Notificações

- `GET /notifications`
- `POST /notifications`
- `GET /notifications/:id`
- `PUT /notifications/:id`
- `DELETE /notifications/:id`

### Histórico

- `GET /action-logs`
- `POST /action-logs`
- `GET /action-logs/:id`
- `PUT /action-logs/:id`
- `DELETE /action-logs/:id`

### Dashboard do familiar

- `GET /patients/:patientId/dashboard/:familyUserId`

## Regras implementadas

- CPF de paciente duplicado retorna `409` com `"CPF já cadastrado"`.
- Paciente aceita no máximo 5 familiares vinculados.
- Cancelamento de consulta só é permitido com pelo menos 24 horas de antecedência.
- Exame só fica visível para familiares após liberação.

Os dados ficam em memória e são apagados ao reiniciar o servidor.
