import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  Bell,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  RefreshCw,
  Save,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserCog,
  UserRoundPlus,
  UsersRound,
  XCircle,
} from 'lucide-react';
import './styles.css';

const API_BASE = '/api';

const roleTabs = [
  { key: 'family', label: 'Familiar Autorizado', icon: ShieldCheck },
  { key: 'attendant', label: 'Atendente da Clínica', icon: Stethoscope },
  { key: 'admin', label: 'Administrador da Clínica', icon: UserCog },
];

const emptyForms = {
  familyLink: {
    patientId: '',
    name: '',
    cpf: '',
    relationship: '',
    email: '',
    createAccess: true,
    passwordHash: '123456',
  },
  appointment: {
    patientId: '',
    specialty: '',
    doctorName: '',
    dateTime: '',
    requestedByUserId: '',
  },
  exam: {
    patientId: '',
    name: '',
    fileUrl: '',
  },
  patient: {
    name: '',
    cpf: '',
    birthDate: '',
    contact: '',
  },
  editPatient: null,
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao consumir a API');
  }

  return data;
}

function App() {
  const [activeRole, setActiveRole] = React.useState('family');
  const [data, setData] = React.useState({
    patients: [],
    users: [],
    appointments: [],
    exams: [],
    notifications: [],
  });
  const [forms, setForms] = React.useState(emptyForms);
  const [selectedFamilyUserId, setSelectedFamilyUserId] = React.useState('');
  const [selectedFamilyPatientId, setSelectedFamilyPatientId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState({
    type: 'info',
    text: 'Inicie o backend em http://localhost:3000 para consumir a API.',
  });

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const [patients, users, appointments, exams, notifications] = await Promise.all([
        request('/patients'),
        request('/users'),
        request('/appointments'),
        request('/exams'),
        request('/notifications'),
      ]);
      setData({ patients, users, appointments, exams, notifications });
      setMessage({ type: 'success', text: 'Dados atualizados pela API.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAll();
  }, [loadAll]);

  React.useEffect(() => {
    const familyUsers = data.users.filter((user) => user.role === 'FAMILY');
    if (!selectedFamilyUserId && familyUsers.length > 0) {
      setSelectedFamilyUserId(familyUsers[0].id);
    }
  }, [data.users, selectedFamilyUserId]);

  const familyUser = data.users.find((user) => user.id === selectedFamilyUserId);
  const allowedPatients = data.patients.filter((patient) =>
    familyUser?.patientIds?.includes(patient.id)
  );
  const selectedFamilyPatient =
    allowedPatients.find((patient) => patient.id === selectedFamilyPatientId) ||
    allowedPatients[0] ||
    null;

  React.useEffect(() => {
    if (selectedFamilyPatient && selectedFamilyPatient.id !== selectedFamilyPatientId) {
      setSelectedFamilyPatientId(selectedFamilyPatient.id);
    }
  }, [selectedFamilyPatient, selectedFamilyPatientId]);

  function updateForm(formName, field, value) {
    setForms((current) => ({
      ...current,
      [formName]: { ...current[formName], [field]: value },
    }));
  }

  function replaceForm(formName, value) {
    setForms((current) => ({ ...current, [formName]: value }));
  }

  async function run(action, successText) {
    setLoading(true);
    try {
      await action();
      await loadAll();
      setMessage({ type: 'success', text: successText });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function linkFamily(event) {
    event.preventDefault();
    const payload = {
      name: forms.familyLink.name,
      cpf: forms.familyLink.cpf,
      relationship: forms.familyLink.relationship,
      email: forms.familyLink.email || null,
    };

    await run(async () => {
      await request(`/patients/${forms.familyLink.patientId}/family-members`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (forms.familyLink.createAccess && forms.familyLink.email) {
        await request('/users', {
          method: 'POST',
          body: JSON.stringify({
            name: forms.familyLink.name,
            email: forms.familyLink.email,
            passwordHash: forms.familyLink.passwordHash,
            role: 'FAMILY',
            patientIds: [forms.familyLink.patientId],
          }),
        });
      }

      replaceForm('familyLink', emptyForms.familyLink);
    }, 'Familiar vinculado ao paciente.');
  }

  async function scheduleAppointment(event) {
    event.preventDefault();
    await run(async () => {
      await request('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          ...forms.appointment,
          patientId: forms.appointment.patientId || selectedFamilyPatient?.id || '',
          requestedByUserId: forms.appointment.requestedByUserId || selectedFamilyUserId || null,
          dateTime: new Date(forms.appointment.dateTime).toISOString(),
        }),
      });
      replaceForm('appointment', {
        ...emptyForms.appointment,
        patientId: selectedFamilyPatient?.id || '',
        requestedByUserId: selectedFamilyUserId,
      });
    }, 'Consulta solicitada pela plataforma.');
  }

  async function cancelAppointment(appointmentId, userId) {
    await run(async () => {
      await request(`/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ userId }),
      });
    }, 'Consulta cancelada.');
  }

  async function createExam(event) {
    event.preventDefault();
    await run(async () => {
      await request('/exams', {
        method: 'POST',
        body: JSON.stringify(forms.exam),
      });
      replaceForm('exam', emptyForms.exam);
    }, 'Exame registrado.');
  }

  async function releaseExam(examId, userId) {
    await run(async () => {
      await request(`/exams/${examId}/release`, {
        method: 'PATCH',
        body: JSON.stringify({ userId }),
      });
    }, 'Resultado liberado para familiares.');
  }

  async function createPatient(event) {
    event.preventDefault();
    await run(async () => {
      await request('/patients', {
        method: 'POST',
        body: JSON.stringify(forms.patient),
      });
      replaceForm('patient', emptyForms.patient);
    }, 'Paciente cadastrado.');
  }

  async function savePatient(event) {
    event.preventDefault();
    await run(async () => {
      await request(`/patients/${forms.editPatient.id}`, {
        method: 'PUT',
        body: JSON.stringify(forms.editPatient),
      });
      replaceForm('editPatient', null);
    }, 'Paciente atualizado.');
  }

  async function removePatient(patientId) {
    await run(async () => {
      await request(`/patients/${patientId}`, { method: 'DELETE' });
    }, 'Paciente removido.');
  }

  const activeTab = roleTabs.find((role) => role.key === activeRole);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Activity size={28} />
          <div>
            <strong>CareLink</strong>
            <span>Portal da clínica</span>
          </div>
        </div>

        <nav className="nav" aria-label="Perfis">
          {roleTabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={activeRole === key ? 'active' : ''}
              type="button"
              onClick={() => setActiveRole(key)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <button className="refresh" type="button" onClick={loadAll} disabled={loading}>
          <RefreshCw size={18} />
          Atualizar dados
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>API: {API_BASE}</p>
            <h1>{activeTab.label}</h1>
          </div>
          <span className={`status ${message.type}`}>{message.text}</span>
        </header>

        {activeRole === 'family' && (
          <FamilyPortal
            appointments={data.appointments}
            exams={data.exams}
            familyUser={familyUser}
            forms={forms}
            notifications={data.notifications}
            patients={allowedPatients}
            selectedPatient={selectedFamilyPatient}
            selectedPatientId={selectedFamilyPatient?.id || ''}
            selectedUserId={selectedFamilyUserId}
            setSelectedPatientId={setSelectedFamilyPatientId}
            setSelectedUserId={setSelectedFamilyUserId}
            updateForm={updateForm}
            users={data.users}
            onCancel={cancelAppointment}
            onSchedule={scheduleAppointment}
          />
        )}

        {activeRole === 'attendant' && (
          <AttendantPortal
            appointments={data.appointments}
            exams={data.exams}
            forms={forms}
            patients={data.patients}
            users={data.users}
            updateForm={updateForm}
            onCreateExam={createExam}
            onLinkFamily={linkFamily}
            onReleaseExam={releaseExam}
          />
        )}

        {activeRole === 'admin' && (
          <AdminPortal
            forms={forms}
            patients={data.patients}
            replaceForm={replaceForm}
            updateForm={updateForm}
            onCreatePatient={createPatient}
            onRemovePatient={removePatient}
            onSavePatient={savePatient}
          />
        )}
      </section>
    </main>
  );
}

function FamilyPortal({
  appointments,
  exams,
  familyUser,
  forms,
  notifications,
  patients,
  selectedPatient,
  selectedPatientId,
  selectedUserId,
  setSelectedPatientId,
  setSelectedUserId,
  updateForm,
  users,
  onCancel,
  onSchedule,
}) {
  const familyUsers = users.filter((user) => user.role === 'FAMILY');
  const patientAppointments = appointments
    .filter((appointment) => appointment.patientId === selectedPatientId)
    .sort((left, right) => new Date(left.dateTime) - new Date(right.dateTime));
  const releasedExams = exams
    .filter((exam) => exam.patientId === selectedPatientId && exam.status === 'Liberado')
    .sort((left, right) => new Date(right.releasedAt || right.createdAt) - new Date(left.releasedAt || left.createdAt));
  const userNotifications = notifications
    .filter((notification) => notification.recipientUserId === selectedUserId)
    .sort((left, right) => new Date(right.sentAt) - new Date(left.sentAt));

  return (
    <div className="grid">
      <Panel title="Acesso do familiar" wide>
        <div className="selector-grid">
          <Select
            label="Familiar autorizado"
            value={selectedUserId}
            onChange={setSelectedUserId}
            options={familyUsers.map(optionFromEntity)}
          />
          <Select
            label="Paciente acompanhado"
            value={selectedPatientId}
            onChange={setSelectedPatientId}
            options={patients.map(optionFromEntity)}
            disabled={!familyUser}
          />
        </div>
        {!familyUser && <Empty text="Cadastre um usuário FAMILY no atendimento para usar este portal." />}
      </Panel>

      <Panel title="HdU02 - Consultas agendadas">
        <CompactList
          items={patientAppointments}
          empty="Nenhuma consulta encontrada para este paciente."
          render={(appointment) => (
            <>
              <strong>{appointment.specialty}</strong>
              <span>{appointment.doctorName}</span>
              <small>{formatDate(appointment.dateTime)} · {appointment.status}</small>
              {appointment.status !== 'Cancelada' && (
                <button
                  className="secondary danger"
                  type="button"
                  onClick={() => onCancel(appointment.id, selectedUserId)}
                  disabled={!selectedUserId}
                >
                  <XCircle size={16} />
                  Cancelar
                </button>
              )}
            </>
          )}
        />
      </Panel>

      <Panel title="HdU03 - Agendar consulta">
        <form onSubmit={onSchedule}>
          <Select
            label="Paciente"
            value={forms.appointment.patientId || selectedPatient?.id || ''}
            onChange={(value) => updateForm('appointment', 'patientId', value)}
            options={patients.map(optionFromEntity)}
            required
          />
          <Field label="Especialidade" value={forms.appointment.specialty} onChange={(value) => updateForm('appointment', 'specialty', value)} required />
          <Field label="Médico" value={forms.appointment.doctorName} onChange={(value) => updateForm('appointment', 'doctorName', value)} required />
          <Field label="Data e hora" type="datetime-local" value={forms.appointment.dateTime} onChange={(value) => updateForm('appointment', 'dateTime', value)} required />
          <input type="hidden" value={selectedUserId} onChange={() => {}} />
          <button className="primary" type="submit" disabled={!selectedUserId}>
            <CalendarPlus size={18} />
            Solicitar consulta
          </button>
        </form>
      </Panel>

      <Panel title="HdU05 - Resultado de exames">
        <CompactList
          items={releasedExams}
          empty="Nenhum exame liberado para este paciente."
          render={(exam) => (
            <>
              <strong>{exam.name}</strong>
              <span>Liberado em {formatDate(exam.releasedAt)}</span>
              <a href={exam.fileUrl} target="_blank" rel="noreferrer">Abrir resultado</a>
            </>
          )}
        />
      </Panel>

      <Panel title="HdU07 - Notificações">
        <CompactList
          items={userNotifications}
          empty="Nenhuma notificação recebida."
          render={(notification) => (
            <>
              <strong>{notification.title}</strong>
              <span>{notification.message}</span>
              <small>{notification.type} · {formatDate(notification.sentAt)}</small>
            </>
          )}
        />
      </Panel>
    </div>
  );
}

function AttendantPortal({
  appointments,
  exams,
  forms,
  patients,
  users,
  updateForm,
  onCreateExam,
  onLinkFamily,
  onReleaseExam,
}) {
  const attendantUsers = users.filter((user) => user.role === 'ATTENDANT' || user.role === 'ADMIN');
  const waitingExams = exams.filter((exam) => exam.status !== 'Liberado');

  return (
    <div className="grid">
      <Panel title="HdU01 - Vincular familiar ao paciente">
        <form onSubmit={onLinkFamily}>
          <Select label="Paciente" value={forms.familyLink.patientId} onChange={(value) => updateForm('familyLink', 'patientId', value)} options={patients.map(optionFromEntity)} required />
          <Field label="Nome do familiar" value={forms.familyLink.name} onChange={(value) => updateForm('familyLink', 'name', value)} required />
          <Field label="CPF" value={forms.familyLink.cpf} onChange={(value) => updateForm('familyLink', 'cpf', value)} required />
          <Field label="Parentesco" value={forms.familyLink.relationship} onChange={(value) => updateForm('familyLink', 'relationship', value)} required />
          <Field label="E-mail" type="email" value={forms.familyLink.email} onChange={(value) => updateForm('familyLink', 'email', value)} />
          <label className="check-row">
            <input
              type="checkbox"
              checked={forms.familyLink.createAccess}
              onChange={(event) => updateForm('familyLink', 'createAccess', event.target.checked)}
            />
            Criar acesso FAMILY para este paciente
          </label>
          {forms.familyLink.createAccess && (
            <Field label="Senha hash inicial" value={forms.familyLink.passwordHash} onChange={(value) => updateForm('familyLink', 'passwordHash', value)} required />
          )}
          <button className="primary" type="submit">
            <UserRoundPlus size={18} />
            Vincular familiar
          </button>
        </form>
      </Panel>

      <Panel title="Registrar exame">
        <form onSubmit={onCreateExam}>
          <Select label="Paciente" value={forms.exam.patientId} onChange={(value) => updateForm('exam', 'patientId', value)} options={patients.map(optionFromEntity)} required />
          <Field label="Nome do exame" value={forms.exam.name} onChange={(value) => updateForm('exam', 'name', value)} required />
          <Field label="URL do arquivo" value={forms.exam.fileUrl} onChange={(value) => updateForm('exam', 'fileUrl', value)} required />
          <button className="primary" type="submit">
            <FlaskConical size={18} />
            Registrar exame
          </button>
        </form>
      </Panel>

      <Panel title="HdU06 - Liberar resultado de exame" wide>
        <div className="list">
          {waitingExams.map((exam) => (
            <article className="item" key={exam.id}>
              <div>
                <strong>{exam.name}</strong>
                <span>{patientName(patients, exam.patientId)} · {exam.status}</span>
                <small>{exam.fileUrl}</small>
              </div>
              <UserAction users={attendantUsers} label="Liberar" onRun={(userId) => onReleaseExam(exam.id, userId)} />
            </article>
          ))}
          {waitingExams.length === 0 && <Empty text="Nenhum exame aguardando liberação." />}
        </div>
      </Panel>

      <Panel title="Consultas da clínica" wide>
        <CompactList
          items={appointments}
          empty="Nenhuma consulta cadastrada."
          render={(appointment) => (
            <>
              <strong>{appointment.specialty} com {appointment.doctorName}</strong>
              <span>{patientName(patients, appointment.patientId)} · {formatDate(appointment.dateTime)}</span>
              <small>{appointment.status}</small>
            </>
          )}
        />
      </Panel>
    </div>
  );
}

function AdminPortal({
  forms,
  patients,
  replaceForm,
  updateForm,
  onCreatePatient,
  onRemovePatient,
  onSavePatient,
}) {
  return (
    <div className="grid">
      <Panel title="Novo paciente">
        <form onSubmit={onCreatePatient}>
          <Field label="Nome" value={forms.patient.name} onChange={(value) => updateForm('patient', 'name', value)} required />
          <Field label="CPF" value={forms.patient.cpf} onChange={(value) => updateForm('patient', 'cpf', value)} required />
          <Field label="Nascimento" type="date" value={forms.patient.birthDate} onChange={(value) => updateForm('patient', 'birthDate', value)} required />
          <Field label="Contato" value={forms.patient.contact} onChange={(value) => updateForm('patient', 'contact', value)} required />
          <button className="primary" type="submit">
            <UserRoundPlus size={18} />
            Cadastrar paciente
          </button>
        </form>
      </Panel>

      <Panel title="Editar paciente">
        {forms.editPatient ? (
          <form onSubmit={onSavePatient}>
            <Field label="Nome" value={forms.editPatient.name} onChange={(value) => updateForm('editPatient', 'name', value)} required />
            <Field label="CPF" value={forms.editPatient.cpf} onChange={(value) => updateForm('editPatient', 'cpf', value)} required />
            <Field label="Nascimento" type="date" value={toDateInputValue(forms.editPatient.birthDate)} onChange={(value) => updateForm('editPatient', 'birthDate', value)} required />
            <Field label="Contato" value={forms.editPatient.contact} onChange={(value) => updateForm('editPatient', 'contact', value)} required />
            <button className="primary" type="submit">
              <Save size={18} />
              Salvar alterações
            </button>
          </form>
        ) : (
          <Empty text="Selecione um paciente na lista para editar." />
        )}
      </Panel>

      <Panel title="HdU08 - Gerenciar pacientes" wide>
        <div className="list">
          {patients.map((patient) => (
            <article className="item" key={patient.id}>
              <div>
                <strong>{patient.name}</strong>
                <span>{patient.cpf} · {formatDate(patient.birthDate)} · {patient.contact}</span>
                <small>{patient.familyMembers?.length || 0} familiares vinculados</small>
              </div>
              <div className="button-row">
                <button className="secondary" type="button" onClick={() => replaceForm('editPatient', patient)}>
                  <ClipboardList size={16} />
                  Editar
                </button>
                <button className="icon-button danger" type="button" title="Remover" onClick={() => onRemovePatient(patient.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
          {patients.length === 0 && <Empty text="Nenhum paciente cadastrado." />}
        </div>
      </Panel>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', ...props }) {
  return (
    <label>
      {label}
      <input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} {...props} />
    </label>
  );
}

function Select({ label, value, onChange, options, ...props }) {
  return (
    <label>
      {label}
      <select value={value || ''} onChange={(event) => onChange(event.target.value)} {...props}>
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function Panel({ title, children, wide = false }) {
  return (
    <section className={wide ? 'panel wide' : 'panel'}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function CompactList({ items, render, empty }) {
  return (
    <div className="list">
      {items.map((item) => (
        <article className="item compact" key={item.id}>
          <div>{render(item)}</div>
        </article>
      ))}
      {items.length === 0 && <Empty text={empty} />}
    </div>
  );
}

function UserAction({ users, label, onRun }) {
  const [userId, setUserId] = React.useState('');

  return (
    <div className="mini-action">
      <select value={userId} onChange={(event) => setUserId(event.target.value)}>
        <option value="">Responsável</option>
        {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
      </select>
      <button type="button" onClick={() => onRun(userId)} disabled={!userId}>
        <CheckCircle2 size={16} />
        {label}
      </button>
    </div>
  );
}

function Empty({ text }) {
  return <p className="empty">{text}</p>;
}

function optionFromEntity(entity) {
  return {
    value: entity.id,
    label: `${entity.name || entity.title} (${entity.id})`,
  };
}

function patientName(patients, patientId) {
  return patients.find((patient) => patient.id === patientId)?.name || patientId;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: value.includes?.('T') ? 'short' : undefined,
  }).format(date);
}

function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

createRoot(document.getElementById('root')).render(<App />);
