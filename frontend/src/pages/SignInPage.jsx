import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn } from "../api/auth";
import { setAuthToken } from "../api/client";
import { useAuth } from "../state/AuthContext.jsx";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const { setSession } = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await signIn({ username, password }); 
      setSession(data.token, { username: data.username, email: data.email });
      setAuthToken(data.token);
      nav("/", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>Sign in</h1>

      <form onSubmit={onSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <button disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
