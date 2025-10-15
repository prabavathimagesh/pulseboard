import supabase from "../api/supabaseClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate("/tickets");
  }

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!email.trim()) return;
    setSubmitting(true);
    const redirectBase =
      import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${redirectBase}/tickets` },
    });
    if (error) setMessage(error.message);
    else setMessage("Check your email for the magic link to sign in.");
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md card p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Welcome to PulseBoard</h1>
          <p className="text-sm text-gray-600 mt-1">Sign in with your email</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">
              Email address
            </label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting}
          >
            {submitting ? "Sending link..." : "Send magic link"}
          </button>
        </form>

        {message && (
          <p className="text-sm mt-4 text-gray-600 text-center">{message}</p>
        )}
      </div>
    </div>
  );
}
