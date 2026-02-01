import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn } from "../../api/auth";
import { setAuthToken } from "../../api/client";
import { getApiErrorMessage, getApiFieldErrors } from "../../api/errors";
import { useAuth } from "../../state/AuthContext.jsx";
import { FaLock, FaUser } from "react-icons/fa";
import { BsRocketTakeoffFill } from "react-icons/bs";

import "./AuthPage.css";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErr, setFieldErr] = useState({ username: "", password: "" });
  const [formErr, setFormErr] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const { setSession } = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setFormErr("");
    setFieldErr({ username: "", password: "" });
    setLoading(true);
    try {
      const data = await signIn({ username, password });
      setSession(data.token, { username: data.username, email: data.email });
      setAuthToken(data.token);
      nav("/", { replace: true });
    } catch (e) {
      const apiFieldErrors = getApiFieldErrors(e);
      const nextFieldErr = {
        username: apiFieldErrors?.username || "",
        password: apiFieldErrors?.password || "",
      };
      const hasFieldErrors = Boolean(nextFieldErr.username || nextFieldErr.password);
      setFieldErr(nextFieldErr);
      setFormErr(
        hasFieldErrors
          ? (apiFieldErrors?.request || "")
          : getApiErrorMessage(e, "Sign in failed"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authShell">
      <div className="authCard">
        <div className="authHeader">
          <div className="authBadge" aria-hidden="true">
            <BsRocketTakeoffFill className="authBadgeIcon" aria-hidden="true" />
          </div>
          <h1 className="authTitle">Welcome Back</h1>
          <p className="authSubtitle">Sign in to continue</p>
        </div>

        <form className="authForm" onSubmit={onSubmit}>
          <div className="field">
            <label className="fieldLabel" htmlFor="signin-username">
              Username
            </label>
            <div className="inputWrap">
              <input
                id="signin-username"
                className={`fieldInput ${fieldErr.username ? "fieldInputError" : ""}`}
                placeholder="Username"
                value={username}
                autoComplete="username"
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErr.username) setFieldErr((p) => ({ ...p, username: "" }));
                  if (formErr) setFormErr("");
                }}
              />
              <FaUser className="fieldIcon" aria-hidden="true" />
            </div>
            {fieldErr.username && (
              <div className="fieldError" role="alert">
                {fieldErr.username}
              </div>
            )}
          </div>

          <div className="field">
            <label className="fieldLabel" htmlFor="signin-password">
              Password
            </label>
            <div className="inputWrap">
              <input
                id="signin-password"
                className={`fieldInput ${fieldErr.password ? "fieldInputError" : ""}`}
                placeholder="Password"
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErr.password) setFieldErr((p) => ({ ...p, password: "" }));
                  if (formErr) setFormErr("");
                }}
              />
              <FaLock className="fieldIcon" aria-hidden="true" />
            </div>
            {fieldErr.password && (
              <div className="fieldError" role="alert">
                {fieldErr.password}
              </div>
            )}
          </div>

          {formErr && (
            <p className="formError" role="alert">
              {formErr}
            </p>
          )}

          <button className="authButton" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="authFooter">
          No account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
