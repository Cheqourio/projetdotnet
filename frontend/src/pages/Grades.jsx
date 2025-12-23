import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGrade, deleteGrade, fetchCourses, fetchGrades, fetchStudents, updateGrade } from '../services/api'
import ConfirmDialog from '../components/ConfirmDialog'

const statusClassMap = {
  Validée: 'badge success',
  'En attente': 'badge warning',
  Rejetée: 'badge danger',
}

const emptyForm = {
  studentId: '',
  courseId: '',
  score: '',
  status: '',
  sessionType: '',
  comment: '',
}

const GradesPage = ({ token: tokenProp }) => {
  const navigate = useNavigate()
  // Récupérer le token depuis localStorage si non fourni en prop
  const token = tokenProp || localStorage.getItem('auth_token') || ''

  const [grades, setGrades] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, info: '' })
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [gradesData, studentsData, coursesData] = await Promise.all([
          fetchGrades(),
          fetchStudents(),
          fetchCourses()
        ])
        setGrades(gradesData)
        setStudents(studentsData)
        setCourses(coursesData)
      } catch (err) {
        setError("Impossible de charger les notes")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const gradeStats = useMemo(
    () => [
      {
        label: 'Moyenne générale',
        value: grades.length
          ? `${(grades.reduce((sum, g) => sum + (g.score ?? 0), 0) / grades.length).toFixed(1)} / 20`
          : '—',
        detail: 'Calculée sur les notes listées',
      },
      { label: 'Notes en attente', value: grades.filter((g) => g.status === 'En attente').length.toString(), detail: 'Statut en attente' },
      { label: 'Notes validées', value: grades.filter((g) => g.status === 'Validée').length.toString(), detail: 'Statut validée' },
    ],
    [grades]
  )

  const filteredGrades = useMemo(() => {
    return grades.filter((grade) => {
      const matchesSearch =
        filters.search === '' ||
        (grade.student && `${grade.student.firstName} ${grade.student.lastName}`.toLowerCase().includes(filters.search.toLowerCase())) ||
        (grade.course && grade.course.title && grade.course.title.toLowerCase().includes(filters.search.toLowerCase())) ||
        (grade.course && grade.course.code && grade.course.code.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesStatus = filters.status === '' || grade.status === filters.status

      return matchesSearch && matchesStatus
    })
  }, [grades, filters])

  const formatId = (grade) => grade.code || `GR-${grade.id.toString().padStart(3, '0')}`
  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : '—')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (grade) => {
    setForm({
      studentId: grade.studentId || '',
      courseId: grade.courseId || '',
      score: grade.score || '',
      status: grade.status || '',
      sessionType: grade.sessionType || '',
      comment: grade.comment || '',
    })
    setEditingId(grade.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token || token.trim() === '') {
      setError("Vous devez être connecté pour effectuer cette action. Veuillez vous reconnecter.")
      return
    }

    // Vérifier que les champs requis sont remplis
    if (!form.studentId || form.studentId === '') {
      setError("Veuillez sélectionner un étudiant")
      setSaving(false)
      return
    }
    if (!form.courseId || form.courseId === '') {
      setError("Veuillez sélectionner un cours")
      setSaving(false)
      return
    }

    setSaving(true)
    setError('')
    try {
      // Créer un payload propre avec seulement les champs nécessaires
      // Ne pas inclure les propriétés de navigation (Student, Course)
      const payload = {
        studentId: Number(form.studentId),
        courseId: Number(form.courseId),
        score: form.score && form.score !== '' ? Number(form.score) : null,
        status: form.status || null,
        sessionType: form.sessionType || null,
        comment: form.comment || null,
      }
      if (editingId) {
        await updateGrade(editingId, payload, token)
        // Recharger toutes les notes pour avoir les objets de navigation à jour
        const updatedGrades = await fetchGrades()
        setGrades(updatedGrades)
        setEditingId(null)
      } else {
        await createGrade(payload, token)
        // Recharger toutes les notes pour avoir les objets de navigation
        const updatedGrades = await fetchGrades()
        setGrades(updatedGrades)
      }
      setForm(emptyForm)
      setShowForm(false)
    } catch (err) {
      const errorMessage = err.message || (editingId ? "Modification impossible" : "Création impossible")
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setError("Session expirée. Redirection vers la page de connexion...")
        localStorage.removeItem('auth_token')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(errorMessage)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const handleDelete = (id) => {
    const grade = grades.find((g) => g.id === id)
    const gradeInfo = grade
      ? `la note de ${grade.student ? `${grade.student.firstName} ${grade.student.lastName}` : 'l\'étudiant'} pour ${grade.course ? grade.course.title : 'le cours'}`
      : 'cette note'
    setConfirmDelete({ isOpen: true, id, info: gradeInfo })
  }

  const confirmDeleteAction = async () => {
    const { id } = confirmDelete
    setConfirmDelete({ isOpen: false, id: null, info: '' })

    if (!token || token.trim() === '') {
      setError("Vous devez être connecté pour effectuer cette action. Veuillez vous reconnecter.")
      return
    }

    setDeleteId(id)
    try {
      await deleteGrade(id, token)
      setGrades((prev) => prev.filter((g) => g.id !== id))
    } catch (err) {
      const errorMessage = err.message || "Suppression impossible"
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setError("Session expirée. Redirection vers la page de connexion...")
        localStorage.removeItem('auth_token')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(errorMessage)
      }
    } finally {
      setDeleteId(null)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilter = () => {
    // Le filtrage est déjà géré par useMemo, cette fonction peut être utilisée pour réinitialiser si nécessaire
    // Pour l'instant, on la garde pour le bouton mais le filtrage se fait en temps réel
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
    })
  }

  if (loading) return <p className="page-loading">Chargement des notes...</p>
  if (error) return <p className="page-error">{error}</p>

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <h1 className="page-title">Notes & Évaluations</h1>
          <p className="page-subtitle">Suivi des résultats et validations</p>
        </div>

        <button type="button" className="button primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm) }}>
          + Saisir une note
        </button>
      </header>

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Modifier la note' : 'Nouvelle note'}</h3>
              <button type="button" className="button ghost" onClick={handleCancel} style={{ padding: '0.5rem' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Étudiant</label>
                    <select
                      className="form-input"
                      name="studentId"
                      value={form.studentId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionner</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cours</label>
                    <select
                      className="form-input"
                      name="courseId"
                      value={form.courseId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionner</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Note</label>
                    <input className="form-input" name="score" value={form.score} onChange={handleChange} type="number" step="0.1" min="0" max="20" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Statut</label>
                    <select
                      className="form-input"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner</option>
                      <option value="Validée">Validée</option>
                      <option value="En attente">En attente</option>
                      <option value="Rejetée">Rejetée</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Session</label>
                  <select
                    className="form-input"
                    name="sessionType"
                    value={form.sessionType}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner</option>
                    <option value="CC">CC</option>
                    <option value="Examen">Examen</option>
                    <option value="Rattrapage">Rattrapage</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Commentaire</label>
                  <input className="form-input" name="comment" value={form.comment} onChange={handleChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="button secondary" onClick={handleCancel}>
                  Annuler
                </button>
                <button type="submit" className="button primary" disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="stats-grid">
        {gradeStats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-detail">{stat.detail}</span>
          </article>
        ))}
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="form-input"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Rechercher..."
          style={{ maxWidth: '300px' }}
        />
        <select className="form-input" name="status" value={filters.status} onChange={handleFilterChange} style={{ maxWidth: '180px' }}>
          <option value="">Statut</option>
          <option value="Validée">Validée</option>
          <option value="En attente">En attente</option>
          <option value="Rejetée">Rejetée</option>
        </select>

        {(filters.search || filters.status) && (
          <button type="button" className="button ghost" onClick={handleResetFilters}>
            Réinitialiser
          </button>
        )}
      </div>

      <div className="table-container">
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--gray-100)' }}>
          <span style={{ fontWeight: 600, color: 'var(--gray-600)' }}>{filteredGrades.length} Notes</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Étudiant</th>
              <th>Cours</th>
              <th>Session</th>
              <th>Note</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrades.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                  Aucun résultat
                </td>
              </tr>
            ) : (
              filteredGrades.map((grade) => (
                <tr key={grade.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{formatId(grade)}</td>
                  <td style={{ fontWeight: 500 }}>{grade.student ? `${grade.student.firstName} ${grade.student.lastName}` : '—'}</td>
                  <td>{grade.course ? grade.course.title : '—'}</td>
                  <td>{grade.sessionType || '—'}</td>
                  <td style={{ fontWeight: 'bold' }}>
                    {grade.score != null ? (
                      <span style={{ color: Number(grade.score) >= 10 ? 'var(--success)' : 'var(--danger)' }}>
                        {Number(grade.score).toFixed(1)}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={statusClassMap[grade.status] || 'badge'}>
                      {grade.status || '—'}
                    </span>
                  </td>
                  <td>{formatDate(grade.updatedAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className="button ghost" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} onClick={() => handleEdit(grade)}>
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="button ghost"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', color: 'var(--danger)' }}
                        onClick={() => handleDelete(grade.id)}
                        disabled={deleteId === grade.id}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, info: '' })}
        onConfirm={confirmDeleteAction}
        title="Confirmer la suppression"
        message={
          <>
            Êtes-vous sûr de vouloir supprimer <strong>{confirmDelete.info}</strong> ?<br />
            Cette action est irréversible.
          </>
        }
      />
    </div>
  )
}

export default GradesPage

