import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "../../api/auth";
import { setAuthToken } from "../../api/client";
import { getApiErrorMessage, getApiFieldErrors } from "../../api/errors";
import { useAuth } from "../../state/AuthContext.jsx";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { BsRocketTakeoffFill } from "react-icons/bs";

import "./AuthPage.css";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErr, setFieldErr] = useState({ username: "", email: "", password: "" });
  const [formErr, setFormErr] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const { setSession } = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setFormErr("");
    setFieldErr({ username: "", email: "", password: "" });
    setLoading(true);
    try {
      const data = await signUp({ username, email, password });
      setSession(data.token, { username: data.username, email: data.email });
      setAuthToken(data.token);
      nav("/", { replace: true });
    } catch (e) {
      const apiFieldErrors = getApiFieldErrors(e);
      const nextFieldErr = {
        username: apiFieldErrors?.username || "",
        email: apiFieldErrors?.email || "",
        password: apiFieldErrors?.password || "",
      };
      const hasFieldErrors = Boolean(nextFieldErr.username || nextFieldErr.email || nextFieldErr.password);
      setFieldErr(nextFieldErr);
      setFormErr(
        hasFieldErrors
          ? (apiFieldErrors?.request || "")
          : getApiErrorMessage(e, "Sign up failed"),
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
          <h1 className="authTitle">Join Us</h1>
          <p className="authSubtitle">Create your account to get started</p>
        </div>

        <form className="authForm" onSubmit={onSubmit}>
          <div className="field">
            <label className="fieldLabel" htmlFor="signup-username">
              Username
            </label>
            <div className="inputWrap">
              <input
                id="signup-username"
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
            <label className="fieldLabel" htmlFor="signup-email">
              Email
            </label>
            <div className="inputWrap">
              <input
                id="signup-email"
                className={`fieldInput ${fieldErr.email ? "fieldInputError" : ""}`}
                placeholder="Email"
                value={email}
                autoComplete="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErr.email) setFieldErr((p) => ({ ...p, email: "" }));
                  if (formErr) setFormErr("");
                }}
              />
              <FaEnvelope className="fieldIcon" aria-hidden="true" />
            </div>
            {fieldErr.email && (
              <div className="fieldError" role="alert">
                {fieldErr.email}
              </div>
            )}
          </div>

          <div className="field">
            <label className="fieldLabel" htmlFor="signup-password">
              Password
            </label>
            <div className="inputWrap">
              <input
                id="signup-password"
                className={`fieldInput ${fieldErr.password ? "fieldInputError" : ""}`}
                placeholder="Password"
                type="password"
                value={password}
                autoComplete="new-password"
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
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="authFooter">
          Already have an account? <Link to="/signin">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
