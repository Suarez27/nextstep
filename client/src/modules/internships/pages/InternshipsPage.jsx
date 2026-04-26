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
import {
  Alert,
  Button,
  EmptyState,
  FormField,
  FormRow,
  LoadingState,
  Modal,
  PageHeader,
  StatusBadge,
} from '../../../shared/components/ui';

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
      title={isEdit ? 'Editar oferta' : 'Nueva oferta de practicas'}
      onClose={onClose}
      actions={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="internship-form" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar oferta'}
          </Button>
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

        {err && <Alert variant="error">{err}</Alert>}
      </form>
    </Modal>
  );
}

function InternshipDetailModal({
  internship,
  canManage,
  canApply,
  onApply,
  onClose,
  onEdit,
  onDeactivate,
}) {
  const activeLabel = internship.is_active ? 'activo' : 'inactivo';
  const canSendApplication = canApply && internship.is_active && internship.status === 'publicada' && Number(internship.available_slots || 0) > 0;

  return (
    <Modal
      title="Ficha de oferta"
      onClose={onClose}
      actions={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          {canManage && (
            <>
              <Button type="button" variant="ghost" onClick={() => onEdit(internship)}>
                Editar
              </Button>
              {internship.is_active && (
                <Button type="button" variant="ghost" onClick={() => onDeactivate(internship)}>
                  Desactivar
                </Button>
              )}
            </>
          )}
          {canSendApplication && (
            <Button type="button" onClick={() => onApply(internship.id)}>
              Postularme
            </Button>
          )}
        </>
      }
    >
      <div className="offer-card-top">
        <div className="offer-icon">&#128188;</div>
        <div>
          <h3 className="offer-title">{internship.title}</h3>
          <div className="offer-company">{internship.company_name}</div>
        </div>
      </div>

      <p className="offer-desc">{internship.description}</p>

      <div className="offer-tags">
        <StatusBadge status={internship.status} />
        <StatusBadge status={activeLabel} />
        {internship.area_label && <span className="tag tag-gray">{internship.area_label}</span>}
        <span className="tag tag-blue">{internship.hours_total}h</span>
        <span className="tag tag-green">{internship.available_slots} disponibles</span>
      </div>

      <div className="table-container mt">
        <table className="data-table">
          <tbody>
            <tr>
              <th>Area</th>
              <td>{internship.area_label || 'Sin area'}</td>
            </tr>
            <tr>
              <th>Horario</th>
              <td>{internship.schedule}</td>
            </tr>
            <tr>
              <th>Plazas</th>
              <td>{internship.slots}</td>
            </tr>
            <tr>
              <th>Plazas disponibles</th>
              <td>{internship.available_slots}</td>
            </tr>
            <tr>
              <th>Candidaturas aceptadas</th>
              <td>{internship.accepted_applications_count || 0}</td>
            </tr>
            <tr>
              <th>Requisitos</th>
              <td>{internship.requirements || 'Sin requisitos especificos'}</td>
            </tr>
            <tr>
              <th>Inicio estimado</th>
              <td>{formatDate(internship.start_date)}</td>
            </tr>
            <tr>
              <th>Fin estimado</th>
              <td>{formatDate(internship.end_date)}</td>
            </tr>
            <tr>
              <th>Limite candidatura</th>
              <td>{formatDate(internship.application_deadline)}</td>
            </tr>
          </tbody>
        </table>
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
  const [editingInternship, setEditingInternship] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState('');
  const [msg, setMsg] = useState('');
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
    } catch (error) {
      setMsg(error.message);
      setInternships([]);
    } finally {
      setLoading(false);
    }
  }, [isCenter, isStudent, onlyAvailable, search, selectedAreaId, selectedStatus]);

  useEffect(() => { load(); }, [load]);

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
      setMsg('Candidatura enviada correctamente.');
      setSelectedInternship(null);
      await load();
    } catch (error) {
      setMsg(error.message);
    }
  }

  async function deactivate(internship) {
    const confirmed = window.confirm(`Desactivar "${internship.title}"?`);
    if (!confirmed) return;

    try {
      const updated = await api.deactivateInternship(internship.id);
      setMsg('Oferta desactivada.');
      if (selectedInternship?.id === internship.id) {
        setSelectedInternship(updated);
      }
      await load();
    } catch (error) {
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
    setMsg('Oferta guardada correctamente.');
    setSelectedInternship(saved);
    load();
  }

  return (
    <div className="page">
      <PageHeader
        title={pageTitle}
        subtitle={`${internships.length} oferta${internships.length !== 1 ? 's' : ''}`}
        actions={
          canManageInternships ? (
            <Button onClick={openCreateForm}>+ Nueva oferta</Button>
          ) : null
        }
      />

      <div className="search-bar">
        <input
          type="text"
          placeholder={canManageInternships ? 'Buscar por titulo o descripcion...' : 'Buscar por titulo, empresa o descripcion...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={selectedAreaId}
          onChange={(e) => setSelectedAreaId(e.target.value)}
          disabled={loadingAreas}
        >
          <option value="">Todas las areas</option>
          {areaOptions.map((option) => (
            <option key={option.item.id} value={option.item.id}>
              {option.label}
            </option>
          ))}
        </select>
        {!isStudent && (
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            {INTERNSHIP_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        {isCenter && (
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />
            Solo con plazas
          </label>
        )}
      </div>

      {msg && <div className="alert-success" onClick={() => setMsg('')}>{msg} (clic para cerrar)</div>}

      {loading ? (
        <LoadingState />
      ) : internships.length === 0 ? (
        <EmptyState
          icon="NS"
          message="No hay ofertas que coincidan con la busqueda."
        >
          {canManageInternships && (
            <Button onClick={openCreateForm}>
              Publicar primera oferta
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="cards-grid">
          {internships.map((item) => (
            <div key={item.id} className="offer-card">
              <div className="offer-card-top">
                <div className="offer-icon">&#128188;</div>
                <div>
                  <h3 className="offer-title">{item.title}</h3>
                  <div className="offer-company">{item.company_name}</div>
                </div>
              </div>

              <p className="offer-desc">{item.description}</p>

              <div className="offer-tags">
                <StatusBadge status={item.status} />
                {canManageInternships && <StatusBadge status={item.is_active ? 'activo' : 'inactivo'} />}
                {item.area_label && <span className="tag tag-gray">{item.area_label}</span>}
                <span className="tag tag-blue">{item.hours_total}h</span>
                <span className="tag tag-green">{item.available_slots} plazas disponibles</span>
                {item.schedule && <span className="tag tag-gray">{item.schedule}</span>}
              </div>

              <Button
                variant="ghost"
                fullWidth
                className="mt"
                onClick={() => setSelectedInternship(item)}
              >
                Ver ficha
              </Button>

              {!canManageInternships && (
                <Button
                  variant="ghost"
                  fullWidth
                  className="mt"
                  onClick={() => openCompany(item.company_id)}
                >
                  Ver empresa
                </Button>
              )}

              {canManageInternships && (
                <FormRow className="mt">
                  <Button type="button" variant="ghost" onClick={() => openEditForm(item)}>
                    Editar
                  </Button>
                  {item.is_active && (
                    <Button type="button" variant="ghost" onClick={() => deactivate(item)}>
                      Desactivar
                    </Button>
                  )}
                </FormRow>
              )}

              {canApplyToInternship && (
                <Button
                  fullWidth
                  className="mt"
                  onClick={() => applyTo(item.id)}
                  disabled={Number(item.available_slots || 0) <= 0}
                >
                  Postularme
                </Button>
              )}
            </div>
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
            <Button type="button" variant="ghost" onClick={closeCompany}>
              Cerrar
            </Button>
          }
        >
          {companyLoading ? (
            <LoadingState />
          ) : companyError ? (
            <Alert variant="error">{companyError}</Alert>
          ) : (
            <CompanyDetailPanel
              company={selectedCompany}
              internships={selectedCompany?.internships || []}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
