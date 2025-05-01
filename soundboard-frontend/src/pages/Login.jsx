import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(formData.email, formData.password);
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
      toast.error("Failed to log in. Please check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-in-up">
        <div className="auth-card-header">
          <div className="float mb-4">
            <span className="text-4xl">🎵</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your SoundBoard account</p>
        </div>
        
        <div className="auth-card-body">
          {error && (
            <div className="bg-error bg-opacity-20 text-error p-4 rounded-xl mb-6 slide-in-up border border-error border-opacity-30">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="text-gray-300 font-medium">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="bg-dark-surface border-gray-800 rounded-xl p-4 hover-glow"
              />
            </div>
            
            <div className="form-group">
              <div className="flex justify-between mb-2">
                <label htmlFor="password" className="text-gray-300 font-medium">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary-light hover-scale">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="bg-dark-surface border-gray-800 rounded-xl p-4 hover-glow"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary w-full mt-8 py-4 text-lg rounded-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          
          <div className="text-center mt-8 pt-6 border-t border-gray-800">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary-light font-bold hover-scale">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
