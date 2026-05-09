import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Button, LoadingState, Alert, StatusBadge } from '../../../shared/components/ui';

export default function InternshipMatchesPanel({ internshipId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const handleStatusChange = async (studentId, status) => {
    try {
      setUpdatingId(studentId);
      setError('');
      await api.setMatchStatus(internshipId, studentId, status, '');
      setMatches((current) =>
        current.map((m) => (m.student_id === studentId ? { ...m, match_status: status } : m))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingState />;

  if (error) return <Alert variant="error">{error}</Alert>;

  if (matches.length === 0) {
    return <p className="my-4 text-gray-500">No hay alumnos en tu centro para preseleccionar.</p>;
  }

  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="font-bold mb-4">Alumnos de tu Centro</h4>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Skills</th>
              <th>Estado Actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((student) => {
              const currentStatus = student.match_status || 'Sin estado';
              return (
                <tr key={student.student_id}>
                  <td>
                    <div className="font-semibold">{student.student_name}</div>
                    <div className="text-sm text-gray-500">{student.student_email}</div>
                  </td>
                  <td className="max-w-xs truncate" title={student.skills}>
                    {student.skills || 'No especificadas'}
                  </td>
                  <td>
                    <StatusBadge status={currentStatus} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={updatingId === student.student_id || currentStatus === 'recomendado'}
                        onClick={() => handleStatusChange(student.student_id, 'recomendado')}
                      >
                        {updatingId === student.student_id ? '...' : 'Recomendar'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={updatingId === student.student_id || currentStatus === 'preseleccionado'}
                        onClick={() => handleStatusChange(student.student_id, 'preseleccionado')}
                      >
                        {updatingId === student.student_id ? '...' : 'Preseleccionar'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={updatingId === student.student_id || currentStatus === 'descartado'}
                        onClick={() => handleStatusChange(student.student_id, 'descartado')}
                      >
                        {updatingId === student.student_id ? '...' : 'Descartar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
