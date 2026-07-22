import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { 
  FaEnvelope, 
  FaLock, 
  FaArrowRight, 
  FaGoogle, 
  FaGithub,
  FaEye,
  FaEyeSlash,
  FaRobot
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        navigate('/dashboard');
        toast.success('Welcome back!');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('password123');
    setRememberMe(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, delay: 0.2, ease: "easeOut" }
    }
  };

  return (
    <div className="login-page-container">
      {/* Background Elements */}
      <div className="login-bg-gradient"></div>
      <div className="login-bg-blob blob-1"></div>
      <div className="login-bg-blob blob-2"></div>
      <div className="login-bg-blob blob-3"></div>

      <div className="login-wrapper">
        {/* Left Side - Brand Section */}
        <div className="login-brand-section">
          <div className="brand-content">
            <motion.div 
              className="brand-logo"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="logo-icon-wrapper">
                <FaRobot className="brand-icon" />
              </div>
              <span className="brand-name">AI Support</span>
            </motion.div>
            
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Welcome Back
            </motion.h1>
            
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Sign in to continue managing your AI customer support
            </motion.p>

            <motion.div 
              className="brand-features"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="feature-item">
                <span className="feature-dot"></span>
                24/7 AI-powered support
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                Multi-channel integration
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                Smart lead capture
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <motion.div 
          className="login-form-section"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="form-container">
            <div className="form-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
            </div>

            <motion.form 
              onSubmit={handleSubmit} 
              className="login-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Email Field */}
              <div className="form-field">
                <label className="field-label">
                  <FaEnvelope className="field-icon" />
                  Email Address
                </label>
                <div className="field-input-wrapper">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="field-input"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-field">
                <label className="field-label">
                  <FaLock className="field-icon" />
                  Password
                </label>
                <div className="field-input-wrapper password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="field-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <FaArrowRight className="btn-arrow" />
                  </>
                )}
              </button>

              {/* Demo Button */}
              <button 
                type="button" 
                className="demo-login-btn"
                onClick={handleDemoLogin}
              >
                <span className="demo-icon">🚀</span>
                Use Demo Credentials
              </button>

              {/* Divider */}
              <div className="form-divider">
                <span>or continue with</span>
              </div>

              {/* Social Buttons */}
              <div className="social-buttons">
                <button type="button" className="social-btn google-btn">
                  <FaGoogle /> Google
                </button>
                <button type="button" className="social-btn github-btn">
                  <FaGithub /> GitHub
                </button>
              </div>
            </motion.form>

            {/* Footer */}
            <div className="form-footer">
              <p>
                Don't have an account? <Link to="/signup" className="signup-link">Create one now</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;














// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAppContext } from '../context/AppContext';
// import toast from 'react-hot-toast';
// import { FaEnvelope, FaLock, FaArrowRight, FaGoogle, FaGithub } from 'react-icons/fa';

// const LoginPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const { login } = useAppContext();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!email || !password) {
//       toast.error('Please fill in all fields');
//       return;
//     }

//     setLoading(true);

//     try {
//       const result = await login(email, password);
      
//       if (result.success) {
//         console.log('✅ Login successful!');
//         navigate('/dashboard');
//         toast.success('Welcome back!');
//       } else {
//         toast.error(result.error || 'Login failed');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       toast.error(error.message || 'Login failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDemoLogin = () => {
//     setEmail('demo@example.com');
//     setPassword('password123');
//   };

//   return (
//     <div className="auth-page login-page">
//       <div className="auth-container">
//         <div className="auth-header">
//           <div className="auth-logo">
//             <span className="logo-icon">🤖</span>
//             <h1>AI Support</h1>
//           </div>
//           <h2>Welcome Back</h2>
//           <p>Sign in to your account to continue</p>
//         </div>

//         <form onSubmit={handleSubmit} className="auth-form">
//           <div className="form-group">
//             <label>
//               <FaEnvelope className="input-icon" />
//               Email Address
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               required
//               className="form-input"
//             />
//           </div>

//           <div className="form-group">
//             <label>
//               <FaLock className="input-icon" />
//               Password
//             </label>
//             <div className="password-input-wrapper">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 required
//                 className="form-input"
//               />
//               <button
//                 type="button"
//                 className="show-password-btn"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? '👁️' : '👁️‍🗨️'}
//               </button>
//             </div>
//             <div className="forgot-password">
//               <Link to="/forgot-password">Forgot Password?</Link>
//             </div>
//           </div>

//           <button type="submit" className="btn-primary auth-btn" disabled={loading}>
//             {loading ? (
//               <>
//                 <span className="spinner"></span> Signing In...
//               </>
//             ) : (
//               <>
//                 Sign In <FaArrowRight />
//               </>
//             )}
//           </button>

//           <button 
//             type="button" 
//             className="btn-secondary demo-btn"
//             onClick={handleDemoLogin}
//           >
//             🚀 Use Demo Credentials
//           </button>

//           <div className="auth-divider">
//             <span>or continue with</span>
//           </div>

//           <div className="social-buttons">
//             <button type="button" className="social-btn google">
//               <FaGoogle /> Google
//             </button>
//             <button type="button" className="social-btn github">
//               <FaGithub /> GitHub
//             </button>
//           </div>
//         </form>

//         <div className="auth-footer">
//           <p>
//             Don't have an account? <Link to="/signup">Sign Up Free</Link>
//           </p>
//           <p className="demo-credentials">
//             Demo: demo@example.com / password123
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;