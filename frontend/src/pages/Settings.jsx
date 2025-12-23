import { useEffect, useState } from 'react'
import { fetchSettings } from '../services/api'

const SettingsPage = () => {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSettings()
        setSettings(data)
      } catch (err) {
        setError("Impossible de charger les paramètres")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getValue = (key, fallback) => settings.find((s) => s.key === key)?.value || fallback

  if (loading) return <p className="page-loading">Chargement des paramètres...</p>
  if (error) return <p className="page-error">{error}</p>

  const accountSettings = [
    { label: "Nom de l’établissement", value: getValue('school.name', '') },
    { label: 'Adresse', value: getValue('school.address', '') },
    { label: 'Email support', value: getValue('school.supportEmail', '') },
    { label: 'Fuseau horaire', value: getValue('school.timezone', '') },
  ]

  const notificationSettings = [
    { label: 'Alertes d’inscription', description: 'Nouveaux étudiants ou transferts', enabled: true },
    { label: 'Validations de notes', description: 'Notes en attente de validation', enabled: true },
    { label: 'Maintenance système', description: 'Alertes planifiées & incidents', enabled: false },
    { label: 'Rapport hebdomadaire', description: 'Résumé des activités clés', enabled: true },
  ]

  const securitySettings = [
    {
      title: 'Authentification à deux facteurs',
      description: 'Renforcez la sécurité du compte administrateur principal.',
      action: 'Activer 2FA',
    },
    {
      title: 'Politiques de mot de passe',
      description: 'Longueur minimale, caractères spéciaux et durée d’expiration.',
      action: 'Modifier',
    },
    {
      title: 'Sessions actives',
      description: 'Gestion des appareils connectés et révocation à distance.',
      action: 'Afficher',
    },
  ]

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-subtitle">Pilotez la plateforme et vos préférences</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="button ghost">
            Annuler
          </button>
          <button type="button" className="button primary">
            Sauvegarder
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <section className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>Identité & organisation</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
            Coordonnées, branding et informations partagées.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {accountSettings.map((field) => (
              <div key={field.label} className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{field.label}</label>
                <input type="text" className="form-input" defaultValue={field.value} />
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>Notifications</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
            Préférences d'alertes in-app et emails.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {notificationSettings.map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--gray-800)', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>{item.description}</p>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                  <input type="checkbox" defaultChecked={item.enabled} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span className="slider" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: item.enabled ? 'var(--primary)' : '#ccc', transition: '.4s', borderRadius: '24px' }}></span>
                  <span style={{ position: 'absolute', content: "", height: '16px', width: '16px', left: item.enabled ? '20px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ height: 'fit-content', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '0.5rem' }}>Sécurité</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
            Sécurisation des comptes et de la plateforme.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {securitySettings.map((item) => (
              <div key={item.title} style={{ padding: '1rem', border: '1px solid var(--gray-200)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ marginRight: '1rem' }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--gray-800)', margin: '0 0 0.25rem 0' }}>{item.title}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>{item.description}</p>
                </div>
                <button type="button" className="button outline" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default SettingsPage
