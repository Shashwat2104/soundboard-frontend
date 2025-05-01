import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setError("");
      setLoading(true);
      await register(formData.username, formData.email, formData.password);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      const errorMsg = "Failed to create an account. " + (err.message || "");
      setError(errorMsg);
      toast.error(errorMsg);
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
          <h1 className="text-3xl font-bold mb-2">Join SoundBoard</h1>
          <p className="text-gray-400">Create your account and start jamming</p>
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
              <label htmlFor="username" className="text-gray-300 font-medium">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Choose a username"
                className="bg-dark-surface border-gray-800 rounded-xl p-4 hover-glow"
              />
            </div>
            
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
              <label htmlFor="password" className="text-gray-300 font-medium">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password (min. 6 characters)"
                className="bg-dark-surface border-gray-800 rounded-xl p-4 hover-glow"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="text-gray-300 font-medium">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className="bg-dark-surface border-gray-800 rounded-xl p-4 hover-glow"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary w-full mt-6 py-4 text-lg rounded-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          
          <div className="text-center mt-8 pt-6 border-t border-gray-800">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-primary-light font-bold hover-scale">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
