function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-icon">🎬</span>
        <span className="navbar-title">Movie Night</span>
      </div>
      <div className="navbar-user">
        <span className="navbar-welcome">👋 {user.username}</span>
        <button className="btn-logout" onClick={onLogout}>Sign Out</button>
      </div>
    </nav>
  );
}

export default Navbar;
