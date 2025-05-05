import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginAdmin({ email, password });
  
      login({
        token: data.token,
        refreshToken: data.refreshToken,
        user: data.user
      });
  
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white p-12 shadow-xl rounded-2xl">
        <div className="flex justify-center mb-8">
          <img src="/Logo.svg" alt="MootechPIC Logo" className="w-36 h-36" />
        </div>
        <h2 className="text-4xl font-bold text-center text-moogreen mb-10">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-full px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-moogreen"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-full px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-moogreen"
          />
          <button
            type="submit"
            className="w-full bg-moogreen hover:bg-moodark text-white font-semibold text-lg py-4 rounded-full transition"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
