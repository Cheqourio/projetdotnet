import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCourse, deleteCourse, fetchCourses, fetchTeachers, updateCourse } from '../services/api'
import ConfirmDialog from '../components/ConfirmDialog'

const statusClassMap = {
  Ouvert: 'badge success',
  Complet: 'badge danger',
  Attente: 'badge warning',
}

const emptyForm = {
  title: '',
  code: '',
  level: '',
  hours: '',
  schedule: '',
  status: '',
  teacherId: '',
}

const CoursesPage = ({ token: tokenProp }) => {
  const navigate = useNavigate()
  // Récupérer le token depuis localStorage si non fourni en prop
  const token = tokenProp || localStorage.getItem('auth_token') || ''

  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, name: '' })
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesData, teachersData] = await Promise.all([
          fetchCourses(),
          fetchTeachers()
        ])
        setCourses(coursesData)
        setTeachers(teachersData)
      } catch (err) {
        setError("Impossible de charger les cours")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const courseStats = useMemo(
    () => [
      { label: 'Cours actifs', value: courses.length.toString(), detail: 'En base' },
      {
        label: 'Cours ouverts',
        value: courses.filter((c) => c.status === 'Ouvert').length.toString(),
        detail: 'Acceptent des inscrits',
      },
      {
        label: 'Cours complets',
        value: courses.filter((c) => c.status === 'Complet').length.toString(),
        detail: 'Capacité atteinte',
      },
    ],
    [courses]
  )

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        filters.search === '' ||
        (course.title && course.title.toLowerCase().includes(filters.search.toLowerCase())) ||
        (course.code && course.code.toLowerCase().includes(filters.search.toLowerCase())) ||
        (course.teacher && `${course.teacher.firstName} ${course.teacher.lastName}`.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesStatus = filters.status === '' || course.status === filters.status

      return matchesSearch && matchesStatus
    })
  }, [courses, filters])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (course) => {
    setForm({
      title: course.title || '',
      code: course.code || '',
      level: course.level || '',
      hours: course.hours || '',
      schedule: course.schedule || '',
      status: course.status || '',
      teacherId: course.teacherId || '',
    })
    setEditingId(course.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token || token.trim() === '') {
      setError("Vous devez être connecté pour effectuer cette action. Veuillez vous reconnecter.")
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = { ...form, teacherId: form.teacherId ? Number(form.teacherId) : null }
      if (editingId) {
        await updateCourse(editingId, payload, token)
        setCourses((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c)))
        setEditingId(null)
      } else {
        const created = await createCourse(payload, token)
        setCourses((prev) => [...prev, created])
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
    const course = courses.find((c) => c.id === id)
    const courseName = course ? course.title : 'ce cours'
    setConfirmDelete({ isOpen: true, id, name: courseName })
  }

  const confirmDeleteAction = async () => {
    const { id } = confirmDelete
    setConfirmDelete({ isOpen: false, id: null, name: '' })

    if (!token || token.trim() === '') {
      setError("Vous devez être connecté pour effectuer cette action. Veuillez vous reconnecter.")
      return
    }

    setDeleteId(id)
    try {
      await deleteCourse(id, token)
      setCourses((prev) => prev.filter((c) => c.id !== id))
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

  if (loading) return <p className="page-loading">Chargement des cours...</p>
  if (error) return <p className="page-error">{error}</p>

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <h1 className="page-title">Nos Cours</h1>
          <p className="page-subtitle">Catalogue des formations et programmes</p>
        </div>

        <button type="button" className="button primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm) }}>
          + Créer un cours
        </button>
      </header>

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Modifier le cours' : 'Nouveau cours'}</h3>
              <button type="button" className="button ghost" onClick={handleCancel} style={{ padding: '0.5rem' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Titre du cours</label>
                  <input className="form-input" name="title" value={form.title} onChange={handleChange} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Code</label>
                    <input className="form-input" name="code" value={form.code} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Niveau</label>
                    <input className="form-input" name="level" value={form.level} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Volume horaire</label>
                    <input className="form-input" name="hours" value={form.hours} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Planning</label>
                    <input className="form-input" name="schedule" value={form.schedule} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Statut</label>
                    <select
                      className="form-input"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner</option>
                      <option value="Ouvert">Ouvert</option>
                      <option value="Complet">Complet</option>
                      <option value="Attente">Attente</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Enseignant</label>
                    <select
                      className="form-input"
                      name="teacherId"
                      value={form.teacherId}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
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
        {courseStats.map((stat) => (
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
          name="search"
          className="form-input"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Rechercher..."
          style={{ maxWidth: '300px' }}
        />
        <select name="status" className="form-input" value={filters.status} onChange={handleFilterChange} style={{ maxWidth: '180px' }}>
          <option value="">Statut</option>
          <option value="Ouvert">Ouvert</option>
          <option value="Complet">Complet</option>
          <option value="Attente">Attente</option>
        </select>

        {(filters.search || filters.status) && (
          <button type="button" className="button ghost" onClick={handleResetFilters}>
            Réinitialiser
          </button>
        )}
      </div>

      <div className="table-container">
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--gray-100)' }}>
          <span style={{ fontWeight: 600, color: 'var(--gray-600)' }}>{filteredCourses.length} Cours</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Titre</th>
              <th>Enseignant</th>
              <th>Niveau</th>
              <th>Horaire</th>
              <th>Planning</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                  Aucun résultat
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{course.code || `CRS-${course.id}`}</td>
                  <td style={{ fontWeight: 500 }}>{course.title}</td>
                  <td>{course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : '—'}</td>
                  <td>{course.level}</td>
                  <td>{course.hours}</td>
                  <td>{course.schedule}</td>
                  <td>
                    <span className={statusClassMap[course.status] || 'badge'}>
                      {course.status || '—'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className="button ghost" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} onClick={() => handleEdit(course)}>
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="button ghost"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', color: 'var(--danger)' }}
                        onClick={() => handleDelete(course.id)}
                        disabled={deleteId === course.id}
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
        onClose={() => setConfirmDelete({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDeleteAction}
        title="Confirmer la suppression"
        message={
          <>
            Êtes-vous sûr de vouloir supprimer <strong>"{confirmDelete.name}"</strong> ?<br />
            Cette action est irréversible.
          </>
        }
      />
    </div>
  )
}

export default CoursesPage

