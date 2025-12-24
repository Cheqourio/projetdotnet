import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import { fetchCourses, fetchGrades, fetchStudents, fetchTeachers } from '../services/api'

const Dashboard = () => {
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [courses, setCourses] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAllPlanning, setShowAllPlanning] = useState(false)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [s, t, c, g] = await Promise.all([
          fetchStudents(),
          fetchTeachers(),
          fetchCourses(),
          fetchGrades(),
        ])
        setStudents(s)
        setTeachers(t)
        setCourses(c)
        setGrades(g)
      } catch {
        // silencieux
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const stats = useMemo(() => {
    const activeStudents = students.filter(s => s.status === 'Actif').length
    const successRate = grades.length && grades.some(g => g.score != null)
      ? Math.round((grades.filter(g => (g.score ?? 0) >= 10).length / grades.length) * 100)
      : 0

    return [
      {
        label: 'Étudiants Actifs',
        value: activeStudents,
        total: students.length,
        trend: '+5%',
        trendUp: true,
        color: 'var(--primary)',
        bg: 'rgba(67, 97, 238, 0.1)',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        )
      },
      {
        label: 'Enseignants',
        value: teachers.length,
        total: null,
        trend: '+2',
        trendUp: true,
        color: '#7209b7',
        bg: 'rgba(114, 9, 183, 0.1)',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        )
      },
      {
        label: 'Cours Ouverts',
        value: courses.filter(c => c.status === 'Ouvert').length,
        total: courses.length,
        trend: 'Stable',
        trendUp: null,
        color: '#4cc9f0',
        bg: 'rgba(76, 201, 240, 0.1)',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        )
      },
      {
        label: 'Taux de Réussite',
        value: `${successRate}%`,
        total: null,
        trend: '+12%',
        trendUp: true,
        color: '#f72585',
        bg: 'rgba(247, 37, 133, 0.1)',
        icon: (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
        )
      },
    ]
  }, [students, teachers, courses, grades])

  const gradeDistribution = useMemo(() => {
    const distribution = [
      { name: 'A (16-20)', value: 0, fill: '#4cc9f0' },
      { name: 'B (14-16)', value: 0, fill: '#4361ee' },
      { name: 'C (12-14)', value: 0, fill: '#3f37c9' },
      { name: 'D (10-12)', value: 0, fill: '#480ca8' },
      { name: 'E (<10)', value: 0, fill: '#f72585' }
    ]

    grades.forEach(g => {
      if (g.score == null) return
      if (g.score >= 16) distribution[0].value++
      else if (g.score >= 14) distribution[1].value++
      else if (g.score >= 12) distribution[2].value++
      else if (g.score >= 10) distribution[3].value++
      else distribution[4].value++
    })

    return distribution
  }, [grades])

  const studentsByLevel = useMemo(() => {
    const levels = {}
    students.forEach(s => {
      if (s.level) {
        levels[s.level] = (levels[s.level] || 0) + 1
      }
    })
    return Object.entries(levels)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [students])

  const COLORS = ['#4361ee', '#3f37c9', '#480ca8', '#560bad', '#7209b7', '#b5179e', '#f72585']

  const allUpcomingClasses = useMemo(() => courses
    .filter((c) => c.schedule && c.status === 'Ouvert')
    .map((c) => ({
      course: c.title,
      teacher: c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : 'Non assigné',
      time: c.schedule,
      level: c.level,
      code: c.code
    })), [courses])

  const upcomingClasses = allUpcomingClasses.slice(0, 4)

  const performanceStats = useMemo(() => {
    if (!grades.length) {
      return {
        average: 0,
        averagePercent: 0,
        bestClass: 'N/A',
        bestCourse: 'N/A'
      }
    }

    // 1. Moyenne globale
    const scores = grades.filter(g => g.score != null).map(g => g.score)
    const totalScore = scores.reduce((sum, s) => sum + s, 0)
    const average = scores.length ? (totalScore / scores.length).toFixed(1) : 0
    const averagePercent = (average / 20) * 100

    // 2. Meilleure Classe (Niveau)
    const levelScores = {}
    grades.forEach(g => {
      const student = students.find(s => s.id === g.studentId)
      if (student && student.level && g.score != null) {
        if (!levelScores[student.level]) {
          levelScores[student.level] = { sum: 0, count: 0 }
        }
        levelScores[student.level].sum += g.score
        levelScores[student.level].count++
      }
    })

    let bestClass = 'N/A';
    let maxAvg = -1;
    Object.entries(levelScores).forEach(([level, data]) => {
      const avg = data.sum / data.count;
      if (avg > maxAvg) {
        maxAvg = avg;
        bestClass = level;
      }
    });

    // 3. Top Cours
    const courseScores = {}
    grades.forEach(g => {
      if (g.score != null && g.courseId) {
        if (!courseScores[g.courseId]) {
          courseScores[g.courseId] = { sum: 0, count: 0 }
        }
        courseScores[g.courseId].sum += g.score
        courseScores[g.courseId].count++
      }
    })

    let bestCourse = 'N/A';
    let maxCourseAvg = -1;
    Object.entries(courseScores).forEach(([courseId, data]) => {
      const avg = data.sum / data.count;
      if (avg > maxCourseAvg) {
        maxCourseAvg = avg;
        const course = courses.find(c => c.id === parseInt(courseId) || c.id === courseId);
        if (course) {
          bestCourse = course.title;
        }
      }
    });

    return {
      average,
      averagePercent,
      bestClass,
      bestCourse
    }
  }, [grades, students, courses])

  if (loading) return <div className="page-loading">Chargement du tableau de bord...</div>

  return (
    <div className="page-content">
      {/* Header with Welcome Message */}
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>Tableau de bord</h1>
          <p className="page-subtitle">
            <span style={{ fontSize: '1.1rem', color: 'var(--gray-700)' }}>
              Bonjour, Admin 👋
            </span>
            <br />
            Voici ce qu'il se passe aujourd'hui dans votre établissement.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.75rem 1.25rem', background: 'white', borderRadius: '1rem', border: '1px solid var(--gray-100)', fontSize: '0.9rem', color: 'var(--gray-600)', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></span>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </header>

      {/* Premium Stats Grid */}
      <section className="stats-grid" style={{ gap: '2rem' }}>
        {stats.map((stat, index) => (
          <article key={index} className="stat-card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.1, transform: 'scale(1.5)', color: stat.color }}>
              {stat.icon}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div>
                <p className="stat-label" style={{ marginBottom: '0.1rem', fontSize: '0.8rem', letterSpacing: '0.05em' }}>{stat.label}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {stat.trend && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: stat.trendUp === true ? 'var(--success)' : stat.trendUp === false ? 'var(--danger)' : 'var(--gray-500)',
                      background: stat.trendUp === true ? 'rgba(46, 196, 182, 0.1)' : 'rgba(0,0,0,0.05)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px'
                    }}>
                      {stat.trend}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="stat-value" style={{ fontSize: '2rem' }}>{stat.value}</div>
            {stat.total && <p className="stat-detail" style={{ marginTop: '0.25rem' }}>Sur {stat.total} enregistrés</p>}
          </article>
        ))}
      </section>

      {/* Modern Charts Grid */}
      <section className="charts-grid" style={{ marginTop: '2rem', gap: '2rem' }}>
        <article className="card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Performance</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Distribution des notes par tranche</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(67, 97, 238, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '1rem' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Répartition</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Effectifs par niveau d'étude</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 350, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentsByLevel}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {studentsByLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '-2rem' }}>
              {studentsByLevel.slice(0, 5).map((entry, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* Activity Sections */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <article className="card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>📅 Cours du Jour</h3>
            <button className="button ghost" style={{ fontSize: '0.85rem' }} onClick={() => setShowAllPlanning(true)}>Voir tout</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingClasses.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: '0.75rem', border: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', background: 'white', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginRight: '1rem', minWidth: '60px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>{item.time?.split('h')[0]}h</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{item.time?.split('h')[1] || '00'}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600 }}>{item.course}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-500)' }}>{item.teacher} • <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{item.code}</span></p>
                </div>
                <span className="badge neutral" style={{ background: 'white', border: '1px solid var(--gray-200)' }}>{item.level}</span>
              </div>
            ))}
            {upcomingClasses.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)', background: 'var(--gray-50)', borderRadius: '1rem' }}>
                <p>Aucun cours programmé aujourd'hui</p>
              </div>
            )}
          </div>
        </article>

        <article className="card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '2rem', background: 'linear-gradient(135deg, var(--primary) 0%, #3f37c9 100%)', color: 'white' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'white' }}>Performance Globale</h3>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>Indicateurs clés de réussite</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                <span>Moyenne de l'établissement</span>
                <span>{performanceStats.average} / 20</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${performanceStats.averagePercent}%`, height: '100%', background: 'white', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                <span>Taux d'assiduité</span>
                <span>96%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '96%', height: '100%', background: '#4cc9f0', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.75rem', backdropFilter: 'blur(10px)' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', opacity: 0.8 }}>Meilleure Classe</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{performanceStats.bestClass}</p>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.75rem', backdropFilter: 'blur(10px)' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', opacity: 0.8 }}>Top Cours</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={performanceStats.bestCourse}>{performanceStats.bestCourse}</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Modal Planning Complet */}
      {showAllPlanning && (
        <div className="modal-overlay" onClick={() => setShowAllPlanning(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Planning Complet du Jour</h3>
              <button className="button ghost" onClick={() => setShowAllPlanning(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {allUpcomingClasses.map((item, idx) => (
                  <div key={`modal-${idx}`} style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--gray-50)', borderRadius: '0.75rem', border: '1px solid var(--gray-100)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', background: 'white', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginRight: '1rem', minWidth: '60px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>{item.time?.split('h')[0]}h</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{item.time?.split('h')[1] || '00'}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600 }}>{item.course}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-500)' }}>{item.teacher} • <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{item.code}</span></p>
                    </div>
                    <span className="badge neutral" style={{ background: 'white', border: '1px solid var(--gray-200)' }}>{item.level}</span>
                  </div>
                ))}
                {allUpcomingClasses.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '2rem' }}>Aucun cours programmé.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
