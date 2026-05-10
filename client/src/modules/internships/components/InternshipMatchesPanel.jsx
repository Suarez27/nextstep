import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { LoadingState } from '../../../shared/components/ui';
import { NsCard, NsBadge, NsButton, NsAlert } from '../../../shared/components/ui';

function getMatchBadgeProps(status) {
  switch (status) {
    case 'recomendado': return { type: 'brand', label: 'Recomendado' };
    case 'preseleccionado': return { type: 'info', label: 'Preseleccionado' };
    case 'descartado': return { type: 'error', label: 'Descartado' };
    default: return { type: 'default', label: 'Sin asignar' };
  }
}

export default function InternshipMatchesPanel({ internshipId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadMatches() {
      try {
        setLoading(true);
        const data = await api.getInternshipMatches(internshipId);
        if (active) setMatches(data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMatches();
    return () => { active = false; };
  }, [internshipId]);

  const handleStatusChange = async (studentId, status, studentName) => {
    try {
      setUpdatingId(studentId);
      setError('');
      setSuccessMsg('');
      await api.setMatchStatus(internshipId, studentId, status, '');
      setMatches((current) =>
        current.map((m) => (m.student_id === studentId ? { ...m, match_status: status } : m))
      );
      setSuccessMsg(`El estado de ${studentName} se ha actualizado a ${status}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Alumnos de tu Centro</h3>
      
      {error && <NsAlert type="error" className="mb-4" onClose={() => setError('')}>{error}</NsAlert>}
      {successMsg && <NsAlert type="success" className="mb-4" onClose={() => setSuccessMsg('')}>{successMsg}</NsAlert>}

      {matches.length === 0 ? (
        <NsCard>
          <p className="text-gray-500 text-center py-4">No hay alumnos en tu centro para preseleccionar.</p>
        </NsCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((student) => {
            const badgeProps = getMatchBadgeProps(student.match_status);
            return (
              <NsCard key={student.student_id} className="flex flex-col justify-between">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <div className="min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 truncate" title={student.student_name}>{student.student_name}</h4>
                      <div className="text-sm text-gray-500 truncate" title={student.student_email}>{student.student_email}</div>
                    </div>
                    <NsBadge type={badgeProps.type} className="flex-shrink-0 mt-1">{badgeProps.label}</NsBadge>
                  </div>
                  <div className="text-sm text-gray-600 mt-3 line-clamp-2" title={student.skills}>
                    <span className="font-medium text-gray-700">Skills:</span> {student.skills || 'No especificadas'}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100 items-center justify-between">
                  <div className="flex gap-2">
                    <NsButton
                      variant="primary"
                      size="sm"
                      disabled={updatingId === student.student_id || student.match_status === 'recomendado'}
                      onClick={() => handleStatusChange(student.student_id, 'recomendado', student.student_name)}
                    >
                      Recomendar
                    </NsButton>
                    <NsButton
                      variant="secondary"
                      size="sm"
                      disabled={updatingId === student.student_id || student.match_status === 'preseleccionado'}
                      onClick={() => handleStatusChange(student.student_id, 'preseleccionado', student.student_name)}
                    >
                      Preseleccionar
                    </NsButton>
                  </div>
                  <NsButton
                    variant="ghost"
                    size="sm"
                    disabled={updatingId === student.student_id || student.match_status === 'descartado'}
                    onClick={() => handleStatusChange(student.student_id, 'descartado', student.student_name)}
                  >
                    Descartar
                  </NsButton>
                </div>
              </NsCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
