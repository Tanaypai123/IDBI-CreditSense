import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';
import Card from '../components/Card';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("Underwriter");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const success = login(username, password);
    if (success) {
      navigate("/");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center font-sans p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold font-outfit text-xl">
            ID
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 font-outfit">
              IDBI Risk Platform
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Access the secure credit underwriting console.
            </p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4 font-inter text-xs">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="block text-slate-600 font-semibold mb-1">User Identifier</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-600 font-semibold mb-1">Secure Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs font-outfit tracking-wider uppercase transition-all duration-200 shadow-sm"
            >
              Sign In to Console
            </button>
          </form>
        </Card>

        {/* Audit Disclaimer */}
        <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 font-medium text-center">
          <Shield className="w-3.5 h-3.5" />
          <span>Restricted to Authorized Underwriters Only.</span>
        </div>
      </div>
    </div>
  );
}
