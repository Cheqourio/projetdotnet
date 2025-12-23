const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} School Manager. Tous droits réservés.</p>
      <div className="footer-links">
        <a href="#">Aide & Support</a>
        <a href="#">Conditions</a>
        <a href="#">Confidentialité</a>
      </div>
    </footer>
  )
}

export default Footer
