import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../auth/context/AuthContext';
import {
  NsCard,
  NsBadge,
  NsButton,
  NsAlert,
  PageHeader,
  LoadingState,
  EmptyState,
  Modal
} from '../../../shared/components/ui';

function getStatusBadgeParams(status) {
  const map = {
    aceptado: { text: 'Aceptado', type: 'success' },
    pendiente_documentacion: { text: 'Pdte. Documentación', type: 'warning' },
    pendiente_convenio: { text: 'Pdte. Convenio', type: 'warning' },
    listo_para_incorporacion: { text: 'Listo Incorporación', type: 'brand' },
    incorporado: { text: 'Incorporado', type: 'info' },
    en_seguimiento: { text: 'En Seguimiento', type: 'info' },
    finalizado: { text: 'Finalizado', type: 'success' },
    cancelado: { text: 'Cancelado', type: 'error' },
  };
  return map[status] || { text: status || 'Desconocido', type: 'default' };
}

function AssignmentDetailModal({ assignment, onClose, user, onRefresh }) {
  const [activeTab, setActiveTab] = useState('seguimiento');

  // Estados Seguimiento
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Estados Evaluación
  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(true);
  const [evalResult, setEvalResult] = useState('Apto');
  const [evalScore, setEvalScore] = useState('');
  const [evalSummary, setEvalSummary] = useState('');
  const [evalSubmitting, setEvalSubmitting] = useState(false);

  useEffect(() => {
    if (assignment?.id) {
      loadData();
    }
  }, [assignment]);

  async function loadData() {
    setLoading(true);
    setEvalLoading(true);
    try {
      const [fData, eData] = await Promise.all([
        api.getFollowups(assignment.id),
        api.getEvaluation(assignment.id).catch(() => null) // si da 404 o error, asumimos null
      ]);
      setFollowups(fData || []);
      // El backend devuelve el objeto si existe, si no igual viene un {} vacío o error
      setEvaluation(eData && eData.id ? eData : null);
    } catch (err) {
      setError('Error al cargar la información del expediente');
    } finally {
      setLoading(false);
      setEvalLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.createFollowup({
        assignment_id: assignment.id,
        content: content.trim()
      });
      setContent('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Error al añadir nota');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEvalSubmit(e) {
    e.preventDefault();
    if (!evalSummary.trim()) return;
    setEvalSubmitting(true);
    setError('');
    try {
      await api.createEvaluation({
        assignment_id: assignment.id,
        resultado: evalResult,
        calificacion: evalScore ? Number(evalScore) : undefined,
        resumen: evalSummary.trim(),
        detalles: ''
      });
      await loadData();
      if (onRefresh) onRefresh(); // Para actualizar la lista principal a 'finalizado'
    } catch (err) {
      setError(err.message || 'Error al guardar la evaluación');
    } finally {
      setEvalSubmitting(false);
    }
  }

  if (!assignment) return null;

  return (
    <Modal title="Detalle del Expediente" onClose={onClose}>
      <div className="font-lexend space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg">{assignment.student_name}</h3>
          <p className="text-sm text-gray-600">Práctica: {assignment.internship_title}</p>
          <p className="text-sm text-gray-600">Empresa: {assignment.company_name}</p>
        </div>

        {error && <NsAlert type="error" className="mb-3" onClose={() => setError('')}>{error}</NsAlert>}

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`py-2 px-4 font-semibold text-sm ${activeTab === 'seguimiento' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('seguimiento')}
          >
            Muro de Seguimiento
          </button>
          <button
            className={`py-2 px-4 font-semibold text-sm ${activeTab === 'evaluacion' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('evaluacion')}
          >
            Evaluación Final
          </button>
        </div>

        {activeTab === 'seguimiento' && (
          <div>
            <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
              <textarea
                className="w-full border rounded-md p-3 text-sm focus:ring-brand-500 focus:border-brand-500 resize-none h-24"
                placeholder="Añadir nueva nota de seguimiento..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={submitting}
              />
              <div className="flex justify-end">
                <NsButton type="submit" size="sm" loading={submitting} disabled={!content.trim()}>
                  Añadir Nota
                </NsButton>
              </div>
            </form>

            {loading ? (
              <LoadingState />
            ) : followups.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay notas de seguimiento aún.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {followups.map(f => (
                  <div key={f.id} className="border-l-2 border-brand-300 pl-4 py-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm text-gray-800">{f.author_name}</span>
                      <span className="text-xs text-gray-500">{new Date(f.created_at).toLocaleString('es-ES')}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{f.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'evaluacion' && (
          <div>
            {evalLoading ? (
              <LoadingState />
            ) : evaluation ? (
              <div className="bg-white border rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-800 text-lg">Resultado de la Evaluación</h4>
                  <NsBadge type={evaluation.result === 'Apto' ? 'success' : 'error'}>
                    {evaluation.result}
                  </NsBadge>
                </div>
                {evaluation.score !== null && evaluation.score !== undefined && (
                  <p className="text-sm">
                    <span className="font-semibold text-gray-700">Calificación:</span> {evaluation.score} / 10
                  </p>
                )}
                <div>
                  <span className="font-semibold text-gray-700 text-sm">Resumen:</span>
                  <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                    {evaluation.summary}
                  </p>
                </div>
              </div>
            ) : user?.role === 'centro' ? (
              <form onSubmit={handleEvalSubmit} className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Completa este formulario para emitir la evaluación final. <strong>Atención:</strong> esta acción cerrará definitivamente el expediente de prácticas.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resultado *</label>
                    <select
                      className="w-full border rounded-md p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                      value={evalResult}
                      onChange={(e) => setEvalResult(e.target.value)}
                      required
                    >
                      <option value="Apto">Apto</option>
                      <option value="No Apto">No Apto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Calificación (0-10)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      className="w-full border rounded-md p-2 text-sm focus:ring-brand-500 focus:border-brand-500"
                      value={evalScore}
                      onChange={(e) => setEvalScore(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resumen de Evaluación *</label>
                  <textarea
                    className="w-full border rounded-md p-3 text-sm focus:ring-brand-500 focus:border-brand-500 resize-none h-24"
                    placeholder="Escribe el resumen final..."
                    value={evalSummary}
                    onChange={(e) => setEvalSummary(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <NsButton type="submit" variant="brand" loading={evalSubmitting} disabled={!evalSummary.trim()}>
                    Registrar Evaluación y Cerrar Práctica
                  </NsButton>
                </div>
              </form>
            ) : (
              <EmptyState 
                icon="⏳"
                message="Este expediente aún no ha sido evaluado."
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    setLoading(true);
    try {
      const data = await api.getAssignments();
      setAssignments(data);
    } catch (err) {
      setError(err.message || 'Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, nextStatus) {
    setUpdating(true);
    setError('');
    setMsg('');
    try {
      const updated = await api.updateAssignmentStatus(id, nextStatus);
      // Usamos 'status' que es como viene del backend
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: updated.status || nextStatus } : a));
      setMsg('Estado de asignación actualizado.');
    } catch (err) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setUpdating(false);
    }
  }

  function renderActions(assignment) {
    const { status, id } = assignment;
    const actions = [];

    actions.push(
      <NsButton key="view" size="sm" variant="ghost" onClick={() => setSelectedAssignment(assignment)} disabled={updating}>
        Ver Expediente
      </NsButton>
    );

    // Transiciones lógicas del ciclo de vida
    if (status === 'aceptado') {
      actions.push(
        <NsButton key="doc-req" size="sm" variant="secondary" onClick={() => handleStatusChange(id, 'pendiente_documentacion')} disabled={updating}>
          Pedir Documentación
        </NsButton>
      );
    } else if (status === 'pendiente_documentacion') {
      actions.push(
        <NsButton key="doc-ok" size="sm" variant="secondary" onClick={() => handleStatusChange(id, 'pendiente_convenio')} disabled={updating}>
          Documentación OK
        </NsButton>
      );
    } else if (status === 'pendiente_convenio') {
      actions.push(
        <NsButton key="conv-ok" size="sm" variant="secondary" onClick={() => handleStatusChange(id, 'listo_para_incorporacion')} disabled={updating}>
          Convenio Firmado
        </NsButton>
      );
    } else if (status === 'listo_para_incorporacion') {
      actions.push(
        <NsButton key="inc-ok" size="sm" variant="primary" onClick={() => handleStatusChange(id, 'incorporado')} disabled={updating}>
          Marcar Incorporado
        </NsButton>
      );
    } else if (status === 'incorporado') {
      actions.push(
        <NsButton key="seg-ok" size="sm" variant="secondary" onClick={() => handleStatusChange(id, 'en_seguimiento')} disabled={updating}>
          Iniciar Seguimiento
        </NsButton>
      );
    } else if (status === 'en_seguimiento') {
      actions.push(
        <NsButton key="fin-ok" size="sm" variant="brand" onClick={() => handleStatusChange(id, 'finalizado')} disabled={updating}>
          Finalizar Práctica
        </NsButton>
      );
    }

    if (!['finalizado', 'cancelado'].includes(status)) {
      actions.push(
        <NsButton key="cancel" size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleStatusChange(id, 'cancelado')} disabled={updating}>
          Cancelar
        </NsButton>
      );
    }

    return actions.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        {actions}
      </div>
    ) : null;
  }

  return (
    <div className="page p-6 max-w-7xl mx-auto font-lexend">
      <PageHeader
        title="Expedientes de Prácticas"
        subtitle="Gestión de asignaciones formales y estado de los alumnos"
      />

      {msg && <NsAlert type="success" className="mb-4" onClose={() => setMsg('')}>{msg}</NsAlert>}
      {error && <NsAlert type="error" className="mb-4" onClose={() => setError('')}>{error}</NsAlert>}

      {loading ? (
        <LoadingState />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon="📁"
          message="No hay expedientes ni asignaciones formales registradas aún."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => {
            const badgeParams = getStatusBadgeParams(assignment.status);

            // Usamos assigned_at asegurándonos de que sea una fecha válida
            const dateStr = assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString('es-ES') : 'Sin fecha';

            return (
              <NsCard key={assignment.id} className="flex flex-col h-full hover:shadow-md transition-shadow border-l-4 border-l-indigo-500">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-gray-800 line-clamp-1" title={assignment.student_name}>
                    {assignment.student_name || 'Alumno Desconocido'}
                  </h3>
                  <NsBadge type={badgeParams.type}>
                    {badgeParams.text}
                  </NsBadge>
                </div>

                <div className="text-sm text-gray-600 space-y-2 flex-1">
                  <p><span className="font-medium text-gray-700">Práctica:</span> {assignment.internship_title || 'N/A'}</p>
                  <p><span className="font-medium text-gray-700">Empresa:</span> {assignment.company_name || 'N/A'}</p>
                  <p><span className="font-medium text-gray-700">Asignado el:</span> {dateStr}</p>
                </div>

                <div className="mt-auto">
                  {renderActions(assignment)}
                </div>
              </NsCard>
            );
          })}
        </div>
      )}

      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          user={user}
          onRefresh={loadAssignments}
        />
      )}
    </div>
  );
}