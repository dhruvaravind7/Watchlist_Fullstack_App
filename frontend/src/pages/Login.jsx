import { useState } from "react";
import.meta.env.VITE_API_URL

function Login({ onLogin }) {
  const [tab, setTab] = useState("signin");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) {
      setMessage("Please fill in both fields.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();

      if (data.message === "Logged in Successfully") {
        const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/get-all-users`);
        const users = await usersRes.json();
        const found = users.find((u) => u[1] === loginUsername);
        if (found) {
          onLogin({ id: found[0], username: found[1] });
        }
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Could not reach server: " + err.message);
    }
    setLoading(false);
  };

  const handleCreation = async () => {
    if (!createUsername || !createPassword || !email) {
      setMessage("Please fill out all fields.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: createUsername, password: createPassword, email }),
      });
      const data = await res.json();

      if (data.message.startsWith("Success!")) {
        const id = parseInt(data.message.split("Your id is ")[1]);
        onLogin({ id, username: createUsername });
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Could not reach server: " + err.message);
    }
    setLoading(false);
  };

  const switchTab = (t) => {
    setTab(t);
    setMessage("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🎬</span>
          <h1>Movie Night</h1>
          <p>Your personal watchlist planner</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "signin" ? "active" : ""}`}
            onClick={() => switchTab("signin")}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => switchTab("register")}
          >
            Create Account
          </button>
        </div>

        {tab === "signin" ? (
          <div className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter your username"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            {message && <p className="auth-message">{message}</p>}
            <button className="btn-primary" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>
        ) : (
          <div className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
                placeholder="Choose a username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Choose a password"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            {message && <p className="auth-message">{message}</p>}
            <button className="btn-primary" onClick={handleCreation} disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
