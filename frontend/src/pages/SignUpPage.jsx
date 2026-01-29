import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "../api/auth";
import { useAuth } from "../state/AuthContext";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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
      const data = await signUp({ username, email, password });
      setSession(data.token, data.user);
      nav("/", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>Sign up</h1>

      <form onSubmit={onSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </div>
  );
}