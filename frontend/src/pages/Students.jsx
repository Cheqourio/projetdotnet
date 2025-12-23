import { useEffect, useMemo, useState } from 'react'
import { createStudent, deleteStudent, fetchStudents, updateStudent } from '../services/api'
import ConfirmDialog from '../components/ConfirmDialog'

const statusClassMap = {
  Actif: 'badge success',
  'En attente': 'badge warning',
  Suspendu: 'badge danger',
}

const DEFAULT_PROGRAM = 'Ingénieur Informatique et Réseaux'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  program: DEFAULT_PROGRAM,
  level: '',
  status: '',
  average: '',
}

const StudentsPage = ({ token: tokenProp }) => {
  // Récupérer le token depuis localStorage si non fourni en prop
  const token = tokenProp || localStorage.getItem('auth_token') || ''
  const [students, setStudents] = useState([])
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
    level: '',
    status: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchStudents()
        setStudents(data)
      } catch (err) {
        setError("Impossible de charger les étudiants")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatId = (student) => student.code || `STD-${student.id.toString().padStart(4, '0')}`
  const fullName = (student) => `${student.firstName} ${student.lastName}`

  const studentStats = useMemo(
    () => [
      { label: 'Actif', value: students.filter((s) => s.status === 'Actif').length.toString(), detail: 'Étudiants actifs' },
      { label: 'En attente', value: students.filter((s) => s.status === 'En attente').length.toString(), detail: 'En attente' },
      { label: 'Suspendu', value: students.filter((s) => s.status === 'Suspendu').length.toString(), detail: 'Suspendus' },
    ],
    [students]
  )

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        filters.search === '' ||
        fullName(student).toLowerCase().includes(filters.search.toLowerCase()) ||
        formatId(student).toLowerCase().includes(filters.search.toLowerCase()) ||
        (student.program && student.program.toLowerCase().includes(filters.search.toLowerCase())) ||
        (student.email && student.email.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesLevel = filters.level === '' || student.level === filters.level

      const matchesStatus = filters.status === '' || student.status === filters.status

      return matchesSearch && matchesLevel && matchesStatus
    })
  }, [students, filters])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (student) => {
    setForm({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      program: DEFAULT_PROGRAM,
      level: student.level || '',
      status: student.status || '',
      average: student.average || '',
    })
    setEditingId(student.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, average: form.average ? Number(form.average) : null }
      if (editingId) {
        await updateStudent(editingId, payload, token)
        setStudents((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...payload } : s)))
        setEditingId(null)
      } else {
        const created = await createStudent(payload, token)
        setStudents((prev) => [...prev, created])
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
    const student = students.find((s) => s.id === id)
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'cet étudiant'
    setConfirmDelete({ isOpen: true, id, name: studentName })
  }

  const confirmDeleteAction = async () => {
    const { id } = confirmDelete
    setConfirmDelete({ isOpen: false, id: null, name: '' })
    setDeleteId(id)
    try {
      await deleteStudent(id, token)
      setStudents((prev) => prev.filter((s) => s.id !== id))
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

  const handleFilter = () => {
    // Le filtrage est déjà géré par useMemo, cette fonction peut être utilisée pour réinitialiser si nécessaire
    // Pour l'instant, on la garde pour le bouton mais le filtrage se fait en temps réel
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      level: '',
      status: '',
    })
  }

  if (loading) {
    return <p className="page-loading">Chargement des étudiants...</p>
  }

  if (error) {
    return <p className="page-error">{error}</p>
  }

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <h1 className="page-title">Étudiants</h1>
          <p className="page-subtitle">Gestion des inscriptions et des résultats</p>
        </div>
        <button type="button" className="button primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm) }}>
          + Nouvel étudiant
        </button>
      </header>

      <div className="stats-grid">
        {studentStats.map((stat) => (
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
        <select name="level" className="form-input" value={filters.level} onChange={handleFilterChange} style={{ maxWidth: '180px' }}>
          <option value="">Niveau</option>
          <option value="1IIR">1IIR</option>
          <option value="2IIR">2IIR</option>
          <option value="3IIR">3IIR</option>
          <option value="4IIR">4IIR</option>
          <option value="5IIR">5IIR</option>
        </select>
        <select name="status" className="form-input" value={filters.status} onChange={handleFilterChange} style={{ maxWidth: '180px' }}>
          <option value="">Statut</option>
          <option value="Actif">Actif</option>
          <option value="En attente">En attente</option>
          <option value="Suspendu">Suspendu</option>
        </select>

        {(filters.search || filters.level || filters.status) && (
          <button type="button" className="button ghost" onClick={handleResetFilters}>
            Réinitialiser
          </button>
        )}
      </div>

      <div className="table-container">
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--gray-600)' }}>{filteredStudents.length} Étudiants</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Étudiant</th>
              <th>Programme</th>
              <th>Niveau</th>
              <th>Statut</th>
              <th>Moyenne</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                  Aucun résultat trouvé
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{formatId(student)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '600', fontSize: '0.85rem'
                      }}>
                        {student.firstName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500' }}>{fullName(student)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{student.program || '-'}</td>
                  <td>{student.level || '-'}</td>
                  <td>
                    <span className={statusClassMap[student.status] || 'badge'}>
                      {student.status || '—'}
                    </span>
                  </td>
                  <td>
                    {student.average ? (
                      <span style={{ fontWeight: '600', color: Number(student.average) >= 10 ? 'var(--success)' : 'var(--danger)' }}>
                        {student.average}/20
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="button ghost"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                        onClick={() => handleEdit(student)}
                      >
                        Éditer
                      </button>
                      <button
                        type="button"
                        className="button ghost"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', color: 'var(--danger)' }}
                        onClick={() => handleDelete(student.id)}
                        disabled={deleteId === student.id}
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

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}</h3>
              <button type="button" className="button ghost" onClick={handleCancel} style={{ padding: '0.5rem' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prénom</label>
                    <input className="form-input" name="firstName" value={form.firstName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input className="form-input" name="lastName" value={form.lastName} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" name="email" value={form.email} onChange={handleChange} required type="email" />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Niveau</label>
                    <select className="form-input" name="level" value={form.level} onChange={handleChange}>
                      <option value="">Sélectionner</option>
                      <option value="1IIR">1IIR</option>
                      <option value="2IIR">2IIR</option>
                      <option value="3IIR">3IIR</option>
                      <option value="4IIR">4IIR</option>
                      <option value="5IIR">5IIR</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Statut</label>
                    <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                      <option value="">Sélectionner</option>
                      <option value="Actif">Actif</option>
                      <option value="En attente">En attente</option>
                      <option value="Suspendu">Suspendu</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Moyenne</label>
                  <input className="form-input" name="average" value={form.average} onChange={handleChange} type="number" step="0.1" max="20" />
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

export default StudentsPage

