import { useEffect, useMemo, useState } from 'react'
import { createTeacher, deleteTeacher, fetchCourses, fetchTeachers, updateTeacher } from '../services/api'
import ConfirmDialog from '../components/ConfirmDialog'

const statusClassMap = {
  Actif: 'badge success',
  Disponible: 'badge info',
  Congé: 'badge warning',
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  status: '',
  hours: '',
  phone: '',
  seniority: '',
}

const TeachersPage = ({ token: tokenProp }) => {
  // Récupérer le token depuis localStorage si non fourni en prop
  const token = tokenProp || localStorage.getItem('auth_token') || ''
  const [teachers, setTeachers] = useState([])
  const [courses, setCourses] = useState([])
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
    subject: '',
    status: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [teacherData, courseData] = await Promise.all([fetchTeachers(), fetchCourses()])
        setTeachers(teacherData)
        setCourses(courseData)
      } catch (err) {
        setError("Impossible de charger les enseignants")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatId = (teacher) => teacher.code || `TCH-${teacher.id.toString().padStart(4, '0')}`
  const fullName = (teacher) => `${teacher.firstName} ${teacher.lastName}`

  const teacherStats = useMemo(
    () => [
      { label: 'Enseignants actifs', value: teachers.length.toString(), detail: 'En base' },
      { label: 'Disponibilités', value: teachers.filter((t) => t.status === 'Disponible').length.toString(), detail: 'Marqués disponible' },
      { label: 'En congé', value: teachers.filter((t) => t.status === 'Congé').length.toString(), detail: 'En pause' },
    ],
    [teachers]
  )

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        filters.search === '' ||
        fullName(teacher).toLowerCase().includes(filters.search.toLowerCase()) ||
        formatId(teacher).toLowerCase().includes(filters.search.toLowerCase()) ||
        (teacher.subject && teacher.subject.toLowerCase().includes(filters.search.toLowerCase())) ||
        (teacher.email && teacher.email.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesSubject = filters.subject === '' || teacher.subject === filters.subject

      const matchesStatus = filters.status === '' || teacher.status === filters.status

      return matchesSearch && matchesSubject && matchesStatus
    })
  }, [teachers, filters])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (teacher) => {
    setForm({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      subject: teacher.subject || '',
      status: teacher.status || '',
      hours: teacher.hours || '',
      phone: teacher.phone || '',
      seniority: teacher.seniority || '',
    })
    setEditingId(teacher.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await updateTeacher(editingId, form, token)
        setTeachers((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...form } : t)))
        setEditingId(null)
      } else {
        const created = await createTeacher(form, token)
        setTeachers((prev) => [...prev, created])
      }
      setForm(emptyForm)
      setShowForm(false)
    } catch (err) {
      setError(editingId ? "Modification impossible" : "Création impossible (vérifiez le token ou les champs)")
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
    const teacher = teachers.find((t) => t.id === id)
    const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'cet enseignant'
    setConfirmDelete({ isOpen: true, id, name: teacherName })
  }

  const confirmDeleteAction = async () => {
    const { id } = confirmDelete
    setConfirmDelete({ isOpen: false, id: null, name: '' })
    setDeleteId(id)
    try {
      await deleteTeacher(id, token)
      setTeachers((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError("Suppression impossible (vérifiez le token)")
    } finally {
      setDeleteId(null)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      subject: '',
      status: '',
    })
  }

  if (loading) return <p className="page-loading">Chargement des enseignants...</p>
  if (error) return <p className="page-error">{error}</p>

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <h1 className="page-title">Équipe pédagogique</h1>
          <p className="page-subtitle">Pilotez les disponibilités et les charges horaires</p>
        </div>

        <button type="button" className="button primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm) }}>
          + Ajouter un enseignant
        </button>
      </header>

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Modifier l\'enseignant' : 'Nouvel enseignant'}</h3>
              <button type="button" className="button ghost" onClick={handleCancel} style={{ padding: '0.5rem' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prénom</label>
                    <input className="form-input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Entrez le prénom" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input className="form-input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Entrez le nom" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" name="email" value={form.email} onChange={handleChange} placeholder="exemple@email.com" required type="email" />
                </div>

                <div className="form-group">
                  <label className="form-label">Spécialité</label>
                  <select
                    className="form-input"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner une spécialité</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.title}>
                        {course.title}
                      </option>
                    ))}
                  </select>
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
                      <option value="Actif">Actif</option>
                      <option value="Disponible">Disponible</option>
                      <option value="Congé">Congé</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Charge horaire</label>
                    <input className="form-input" name="hours" value={form.hours} onChange={handleChange} placeholder="Ex: 20h" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+33 6..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ancienneté</label>
                    <input className="form-input" name="seniority" value={form.seniority} onChange={handleChange} placeholder="Ex: 5 ans" />
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
        {teacherStats.map((stat) => (
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
        <select className="form-input" name="subject" value={filters.subject} onChange={handleFilterChange} style={{ maxWidth: '200px' }}>
          <option value="">Spécialité</option>
          {courses.map((course) => (
            <option key={course.id} value={course.title}>
              {course.title}
            </option>
          ))}
        </select>
        <select className="form-input" name="status" value={filters.status} onChange={handleFilterChange} style={{ maxWidth: '180px' }}>
          <option value="">Statut</option>
          <option value="Actif">Actif</option>
          <option value="Disponible">Disponible</option>
          <option value="Congé">Congé</option>
        </select>

        {(filters.search || filters.subject || filters.status) && (
          <button type="button" className="button ghost" onClick={handleResetFilters}>
            Réinitialiser
          </button>
        )}
      </div>

      <div className="table-container">
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--gray-100)' }}>
          <span style={{ fontWeight: 600, color: 'var(--gray-600)' }}>{filteredTeachers.length} Enseignants</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Enseignant</th>
              <th>Spécialité</th>
              <th>Contact</th>
              <th>Statut</th>
              <th>Charge</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                  Aucun résultat
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{formatId(teacher)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', background: 'var(--secondary)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '600', fontSize: '0.85rem'
                      }}>
                        {teacher.firstName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{fullName(teacher)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{teacher.seniority || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{teacher.subject || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      <a href={`mailto:${teacher.email}`} style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{teacher.email}</a>
                      {teacher.phone && <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{teacher.phone}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={statusClassMap[teacher.status] || 'badge'}>
                      {teacher.status || '—'}
                    </span>
                  </td>
                  <td>{teacher.hours || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="button ghost"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                        onClick={() => handleEdit(teacher)}
                      >
                        Éditer
                      </button>
                      <button
                        type="button"
                        className="button ghost"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', color: 'var(--danger)' }}
                        onClick={() => handleDelete(teacher.id)}
                        disabled={deleteId === teacher.id}
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
            Êtes-vous sûr de vouloir supprimer <strong>{confirmDelete.name}</strong> ?<br />
            Cette action est irréversible.
          </>
        }
      />
    </div>
  )
}

export default TeachersPage
