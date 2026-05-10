import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../auth/context/AuthContext';
import { useCanAccess } from '../../../shared/hooks/useCanAccess';
import { useCatalogOptions } from '../../../shared/hooks/useCatalogs';
import {
  DEFAULT_COMPANY_INTERNSHIP_STATUS,
  INTERNSHIP_STATUS_OPTIONS,
} from '../../../shared/config/internships';
import CompanyDetailPanel from '../../companies/components/CompanyDetailPanel';
import InternshipMatchesPanel from '../components/InternshipMatchesPanel';
import {
  NsAlert,
  NsButton,
  NsBadge,
  NsCard,
  EmptyState,
  FormField,
  FormRow,
  LoadingState,
  Modal,
  PageHeader,
  NsConfirmModal,
} from '../../../shared/components/ui';
import { Search as SearchIcon } from '@mui/icons-material';

function formatDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-ES');
}

function toDateInput(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function buildInitialForm(internship) {
  return {
    title: internship?.title || '',
    description: internship?.description || '',
    area_item_id: internship?.area_item_id ? String(internship.area_item_id) : '',
    hours_total: internship?.hours_total || 300,
    schedule: internship?.schedule || '',
    slots: internship?.slots || 1,
    requirements: internship?.requirements || '',
    start_date: toDateInput(internship?.start_date),
    end_date: toDateInput(internship?.end_date),
    application_deadline: toDateInput(internship?.application_deadline),
    status: internship?.status || DEFAULT_COMPANY_INTERNSHIP_STATUS,
    is_active: typeof internship?.is_active === 'boolean' ? internship.is_active : true,
  };
}

function buildPayload(form) {
  return {
    ...form,
    area_item_id: form.area_item_id ? Number(form.area_item_id) : null,
    hours_total: Number(form.hours_total),
    slots: Number(form.slots),
    requirements: form.requirements || null,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    application_deadline: form.application_deadline || null,
    is_active: Boolean(form.is_active),
  };
}

function applicationErrorMessage(error) {
  const message = error?.message || '';
  if (message.includes('Ya postulaste')) return 'Ya existe una candidatura para esta oferta.';
  if (message.includes('no esta disponible')) return 'La oferta ya no esta disponible para candidaturas.';
  if (message.includes('no tiene plazas') || message.includes('No quedan plazas')) return 'La oferta no tiene plazas disponibles.';
  if (message.includes('permisos') || message.includes('Solo cuentas de alumno')) return 'No tienes permisos para postularte a esta oferta.';
  return message || 'No se pudo enviar la candidatura.';
}

function InternshipFormModal({ internship, areaOptions, loadingAreas, onClose, onSaved }) {
  const isEdit = Boolean(internship?.id);
  const [form, setForm] = useState(() => buildInitialForm(internship));
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    const nextValue = type === 'checkbox' ? checked : type === 'number' ? Number(value) : value;
    setForm((current) => ({ ...current, [name]: nextValue }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const payload = buildPayload(form);
      const saved = isEdit
        ? await api.updateInternship(internship.id, payload)
        : await api.createInternship(payload);
      onSaved(saved);
      onClose();
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={isEdit ? 'Editar oferta' : 'Nueva oferta de prácticas'}
      onClose={onClose}
      actions={
        <>
          <NsButton type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </NsButton>
          <NsButton type="submit" form="internship-form" loading={loading}>
            {loading ? 'Guardando...' : 'Guardar oferta'}
          </NsButton>
        </>
      }
    >
      <form id="internship-form" onSubmit={handleSubmit}>
        <FormField label="Titulo">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={200}
            placeholder="Ej: Practicas Frontend Junior"
          />
        </FormField>

        <FormField label="Descripcion">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            maxLength={4000}
            rows={4}
            placeholder="Descripcion del puesto, tareas y contexto"
          />
        </FormField>

        <FormField label="Area" hint={loadingAreas ? 'Cargando areas...' : ''}>
          <select
            name="area_item_id"
            value={form.area_item_id}
            onChange={handleChange}
            disabled={loadingAreas}
          >
            <option value="">Sin area</option>
            {areaOptions.map((option) => (
              <option key={option.item.id} value={option.item.id}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormRow>
          <FormField label="Horas totales">
            <input
              name="hours_total"
              type="number"
              min={1}
              max={2000}
              value={form.hours_total}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Plazas">
            <input
              name="slots"
              type="number"
              min={1}
              max={1000}
              value={form.slots}
              onChange={handleChange}
              required
            />
          </FormField>
        </FormRow>

        <FormField label="Horario">
          <input
            name="schedule"
            value={form.schedule}
            onChange={handleChange}
            required
            maxLength={120}
            placeholder="Ej: L-V 09:00-14:00"
          />
        </FormField>

        <FormField label="Requisitos">
          <textarea
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            maxLength={4000}
            rows={3}
            placeholder="Conocimientos, herramientas o condiciones"
          />
        </FormField>

        <FormRow>
          <FormField label="Fecha inicio estimada">
            <input name="start_date" type="date" value={form.start_date} onChange={handleChange} />
          </FormField>
          <FormField label="Fecha fin estimada">
            <input name="end_date" type="date" value={form.end_date} onChange={handleChange} />
          </FormField>
        </FormRow>

        <FormField label="Fecha limite candidatura">
          <input name="application_deadline" type="date" value={form.application_deadline} onChange={handleChange} />
        </FormField>

        <FormRow>
          <FormField label="Estado">
            <select name="status" value={form.status} onChange={handleChange} required>
              {INTERNSHIP_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Activo">
            <label className="checkbox-inline">
              <input
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={handleChange}
              />
              Oferta activa
            </label>
          </FormField>
        </FormRow>

        {err && <NsAlert type="error">{err}</NsAlert>}
      </form>
    </Modal>
  );
}

function InternshipDetailModal({
  internship,
  canManage,
  canApply,
  alreadyApplied,
  isCenter,
  onApply,
  onClose,
  onEdit,
  onDeactivate,
}) {
  const activeLabel = internship.is_active ? 'activo' : 'inactivo';
  const canSendApplication = canApply && !alreadyApplied && internship.is_active && internship.status === 'publicada' && Number(internship.available_slots || 0) > 0;

  return (
    <Modal
      title="Ficha de oferta"
      onClose={onClose}
      actions={
        <>
          <NsButton type="button" variant="ghost" onClick={onClose}>
            Cerrar
          </NsButton>
          {canManage && (
            <>
              <NsButton type="button" variant="secondary" onClick={() => onEdit(internship)}>
                Editar
              </NsButton>
              {internship.is_active && (
                <NsButton type="button" variant="danger" onClick={() => onDeactivate(internship)}>
                  Desactivar
                </NsButton>
              )}
            </>
          )}
          {canSendApplication && (
            <NsButton type="button" onClick={() => onApply(internship.id)}>
              Postularme
            </NsButton>
          )}
          {canApply && alreadyApplied && (
            <NsButton type="button" variant="ghost" disabled>
              Candidatura enviada
            </NsButton>
          )}
        </>
      }
    >
      <div className="max-w-7xl mx-auto grid gap-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-brand-50 text-brand-600 rounded-xl text-2xl">
            💼
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{internship.title}</h3>
            <div className="text-sm font-medium text-gray-500">{internship.company_name}</div>
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed">{internship.description}</p>

        <div className="flex flex-wrap gap-2">
          <NsBadge type={internship.status === 'publicada' ? 'success' : 'default'}>{internship.status}</NsBadge>
          <NsBadge type={internship.is_active ? 'info' : 'default'}>{activeLabel}</NsBadge>
          {internship.area_label && <NsBadge type="default">{internship.area_label}</NsBadge>}
          <NsBadge type="brand">{internship.hours_total}h</NsBadge>
          <NsBadge type="success">{internship.available_slots} disponibles</NsBadge>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <th className="px-6 py-4 bg-gray-50 text-left text-sm font-medium text-gray-500 w-1/3">Área</th>
                <td className="px-6 py-4 text-sm text-gray-900">{internship.area_label || 'Sin área'}</td>
              </tr>
              <tr>
                <th className="px-6 py-4 bg-gray-50 text-left text-sm font-medium text-gray-500">Horario</th>
                <td className="px-6 py-4 text-sm text-gray-900">{internship.schedule}</td>
              </tr>
              <tr>
                <th className="px-6 py-4 bg-gray-50 text-left text-sm font-medium text-gray-500">Plazas</th>
                <td className="px-6 py-4 text-sm text-gray-900">{internship.slots}</td>
              </tr>
              <tr>
                <th className="px-6 py-4 bg-gray-50 text-left text-sm font-medium text-gray-500">Plazas disponibles</th>
                <td className="px-6 py-4 text-sm text-gray-900">{internship.available_slots}</td>
              </tr>
              <tr>
                <th className="px-6 py-4 bg-gray-50 text-left text-sm font-medium text-gray-500">Candidaturas aceptadas</th>
                <td className="px-6 py-4 text-sm text-gray-900">{internship.accepted_applications_count || 0}</td>
              </tr>
              <tr>
                <th className="px-6 py-4 bg-gray-50 text-left text-sm font-medium text-gray-500">Requisitos</th>
                <td className="px-6 py-4 text-sm text-gray-900">{internship.requirements || 'Sin requisitos específicos'}</td>
              </tr>
              <tr>
                <th className="px-6 py-4 bg-gray-50 text-left text-sm font-medium text-gray-500">Inicio estimado</th>
                <td className="px-6 py-4 text-sm text-gray-900">{formatDate(internship.start_date)}</td>
              </tr>
              <tr>
                <th className="px-6 py-4 bg-gray-50 text-left text-sm font-medium text-gray-500">Fin estimado</th>
                <td className="px-6 py-4 text-sm text-gray-900">{formatDate(internship.end_date)}</td>
              </tr>
              <tr>
                <th className="px-6 py-4 bg-gray-50 text-left text-sm font-medium text-gray-500">Límite candidatura</th>
                <td className="px-6 py-4 text-sm text-gray-900">{formatDate(internship.application_deadline)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {isCenter && <InternshipMatchesPanel internshipId={internship.id} />}
      </div>
    </Modal>
  );
}

export default function InternshipsPage() {
  const { user } = useAuth();
  const canManageInternships = useCanAccess('internshipCreate');
  const canApplyToInternship = useCanAccess('internshipApply');
  const isStudent = user?.role === 'alumno';
  const isCenter = user?.role === 'centro';
  const { options: areaOptions, loading: loadingAreas } = useCatalogOptions('areas');

  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, internship: null });
  const [editingInternship, setEditingInternship] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  const pageTitle = useMemo(() => {
    if (canManageInternships) return 'Mis ofertas de practicas';
    if (isStudent) return 'Ofertas disponibles';
    return 'Ofertas de practicas';
  }, [canManageInternships, isStudent]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (search.trim()) filters.q = search.trim();
      if (selectedAreaId) filters.area_item_id = selectedAreaId;
      if (selectedStatus) filters.status = selectedStatus;
      if (isStudent) filters.available = true;
      if (isCenter) filters.available = onlyAvailable;

      const data = await api.getInternships(filters);
      setInternships(data);
      if (isStudent) {
        const studentApplications = await api.myApplications();
        setApplications(studentApplications);
      }
    } catch (error) {
      setMsgType('error');
      setMsg(error.message);
      setInternships([]);
    } finally {
      setLoading(false);
    }
  }, [isCenter, isStudent, onlyAvailable, search, selectedAreaId, selectedStatus]);

  useEffect(() => { load(); }, [load]);

  const appliedInternshipIds = useMemo(
    () => new Set(applications.map((application) => Number(application.internship_id))),
    [applications]
  );

  function openCreateForm() {
    setEditingInternship(null);
    setShowForm(true);
  }

  function openEditForm(internship) {
    setSelectedInternship(null);
    setEditingInternship(internship);
    setShowForm(true);
  }

  async function applyTo(id) {
    try {
      await api.applyToInternship(id);
      setMsgType('success');
      setMsg('Candidatura enviada correctamente.');
      setSelectedInternship(null);
      await load();
    } catch (error) {
      setMsgType('error');
      setMsg(applicationErrorMessage(error));
    }
  }

  function deactivate(internship) {
    setConfirmModal({ isOpen: true, internship });
  }

  async function handleConfirmDeactivate() {
    const internship = confirmModal.internship;
    setConfirmModal({ isOpen: false, internship: null });
    if (!internship) return;

    try {
      const updated = await api.deactivateInternship(internship.id);
      setMsgType('success');
      setMsg('Oferta desactivada.');
      if (selectedInternship?.id === internship.id) {
        setSelectedInternship(updated);
      }
      await load();
    } catch (error) {
      setMsgType('error');
      setMsg(error.message);
    }
  }

  async function openCompany(companyId) {
    if (!companyId) return;

    setCompanyLoading(true);
    setCompanyError('');
    setSelectedCompany(null);
    try {
      const data = await api.getCompanyDetail(companyId);
      setSelectedCompany(data);
    } catch (error) {
      setCompanyError(error.message);
    } finally {
      setCompanyLoading(false);
    }
  }

  function closeCompany() {
    setSelectedCompany(null);
    setCompanyError('');
    setCompanyLoading(false);
  }

  function handleSaved(saved) {
    setMsgType('success');
    setMsg('Oferta guardada correctamente.');
    setSelectedInternship(saved);
    load();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-500 text-sm mt-1">{internships.length} oferta{internships.length !== 1 ? 's' : ''}</p>
        </div>
        {canManageInternships && (
          <NsButton onClick={openCreateForm}>+ Nueva oferta</NsButton>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2.5 border transition-colors"
            placeholder={canManageInternships ? 'Buscar por título o descripción...' : 'Buscar por título, empresa o descripción...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <select
            className="w-full md:w-48 rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2.5 border transition-colors bg-white"
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            disabled={loadingAreas}
          >
            <option value="">Todas las áreas</option>
            {areaOptions.map((option) => (
              <option key={option.item.id} value={option.item.id}>
                {option.label}
              </option>
            ))}
          </select>

          {!isStudent && (
            <select 
              className="w-full md:w-48 rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2.5 border transition-colors bg-white"
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {INTERNSHIP_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {isCenter && (
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-brand-600 shadow-sm focus:border-brand-300 focus:ring focus:ring-brand-200 focus:ring-opacity-50"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
              />
              Solo con plazas
            </label>
          )}
        </div>
      </div>

      {msg && <NsAlert type={msgType} onClose={() => setMsg('')}>{msg}</NsAlert>}

      {loading ? (
        <LoadingState />
      ) : internships.length === 0 ? (
        <EmptyState
          icon="NS"
          message="No hay ofertas que coincidan con la búsqueda."
        >
          {canManageInternships && (
            <NsButton onClick={openCreateForm}>
              Publicar primera oferta
            </NsButton>
          )}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {internships.map((item) => (
            <NsCard key={item.id} className="flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                  💼
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate" title={item.title}>{item.title}</h3>
                  <div className="text-sm text-gray-500 truncate" title={item.company_name}>{item.company_name}</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-4" title={item.description}>{item.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <NsBadge type={item.status === 'publicada' ? 'success' : 'default'}>{item.status}</NsBadge>
                {canManageInternships && <NsBadge type={item.is_active ? 'info' : 'default'}>{item.is_active ? 'activo' : 'inactivo'}</NsBadge>}
                {item.area_label && <NsBadge type="default">{item.area_label}</NsBadge>}
                <NsBadge type="brand">{item.hours_total}h</NsBadge>
                <NsBadge type="success">{item.available_slots} plazas</NsBadge>
              </div>

              <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
                <NsButton
                  variant="secondary"
                  className="w-full"
                  size="sm"
                  onClick={() => setSelectedInternship(item)}
                >
                  Ver ficha
                </NsButton>

                {!canManageInternships && (
                  <NsButton
                    variant="ghost"
                    className="w-full"
                    size="sm"
                    onClick={() => openCompany(item.company_id)}
                  >
                    Ver empresa
                  </NsButton>
                )}

                {canManageInternships && (
                  <div className="flex gap-2">
                    <NsButton type="button" variant="ghost" size="sm" className="flex-1" onClick={() => openEditForm(item)}>
                      Editar
                    </NsButton>
                    {item.is_active && (
                      <NsButton type="button" variant="ghost" size="sm" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => deactivate(item)}>
                        Desactivar
                      </NsButton>
                    )}
                  </div>
                )}

                {canApplyToInternship && (
                  <NsButton
                    variant={appliedInternshipIds.has(Number(item.id)) ? 'secondary' : 'primary'}
                    className="w-full"
                    size="sm"
                    onClick={() => applyTo(item.id)}
                    disabled={appliedInternshipIds.has(Number(item.id)) || Number(item.available_slots || 0) <= 0}
                  >
                    {appliedInternshipIds.has(Number(item.id)) ? 'Candidatura enviada' : 'Postularme'}
                  </NsButton>
                )}
              </div>
            </NsCard>
          ))}
        </div>
      )}

      {showForm && (
        <InternshipFormModal
          internship={editingInternship}
          areaOptions={areaOptions}
          loadingAreas={loadingAreas}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}

      {selectedInternship && (
        <InternshipDetailModal
          internship={selectedInternship}
          canManage={canManageInternships}
          canApply={canApplyToInternship}
          alreadyApplied={appliedInternshipIds.has(Number(selectedInternship.id))}
          isCenter={isCenter}
          onApply={applyTo}
          onClose={() => setSelectedInternship(null)}
          onEdit={openEditForm}
          onDeactivate={deactivate}
        />
      )}

      {(companyLoading || selectedCompany || companyError) && (
        <Modal
          title="Ficha de empresa"
          onClose={closeCompany}
          actions={
            <NsButton type="button" variant="ghost" onClick={closeCompany}>
              Cerrar
            </NsButton>
          }
        >
          {companyLoading ? (
            <LoadingState />
          ) : companyError ? (
            <NsAlert type="error">{companyError}</NsAlert>
          ) : (
            <CompanyDetailPanel
              company={selectedCompany}
              internships={selectedCompany?.internships || []}
            />
          )}
        </Modal>
      )}

      <NsConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, internship: null })}
        onConfirm={handleConfirmDeactivate}
        title="Desactivar oferta"
        message={`¿Estás seguro de que deseas desactivar la oferta "${confirmModal.internship?.title}"? Esta acción impedirá que se envíen nuevas candidaturas.`}
        type="danger"
        confirmText="Desactivar"
      />
    </div>
  );
}
