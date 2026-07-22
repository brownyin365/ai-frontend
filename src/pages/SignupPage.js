import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaBuilding, 
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaRobot,
  FaCheckCircle,
  FaCity,
  FaGlobe,
  FaMapPin
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { register } from '../services/api';

const SignupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    industry: 'technology',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const industries = [
    { value: 'bank', label: '🏦 Banking' },
    { value: 'school', label: '🏫 School' },
    { value: 'hotel', label: '🏨 Hotel' },
    { value: 'ecommerce', label: '🛍️ E-commerce' },
    { value: 'immigration', label: '🌍 Immigration' },
    { value: 'technology', label: '💻 Technology' },
    { value: 'healthcare', label: '🏥 Healthcare' },
    { value: 'realestate', label: '🏠 Real Estate' },
    { value: 'other', label: '📌 Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const businessData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        industry: formData.industry,
        address: formData.address
      };

      console.log('📝 Registering business:', businessData);
      
      const response = await register(businessData);
      
      console.log('✅ Registration response:', response.data);
      
      if (response.data && response.data.success) {
        const { token, business } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('businessId', business.id);
        localStorage.setItem('user', JSON.stringify(business));
        
        toast.success('Account created successfully!');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error(response.data?.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
    <div className="signup-page-container">
      {/* Background Elements */}
      <div className="signup-bg-gradient"></div>
      <div className="signup-bg-blob blob-1"></div>
      <div className="signup-bg-blob blob-2"></div>
      <div className="signup-bg-blob blob-3"></div>

      <div className="signup-wrapper">
        {/* Left Side - Brand Section */}
        <div className="signup-brand-section">
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
              Create Account
            </motion.h1>
            
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Start your 14-day free trial and transform your customer support
            </motion.p>

            <motion.div 
              className="brand-features"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="feature-item">
                <span className="feature-dot"></span>
                No credit card required
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                Full access to all features
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                Cancel anytime
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <motion.div 
          className="signup-form-section"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="form-container">
            <div className="form-header">
              <h2>Get Started</h2>
              <p>Create your account and start automating your support</p>
            </div>

            <motion.form 
              onSubmit={handleSubmit} 
              className="signup-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Business Name & Email */}
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">
                    <FaBuilding className="field-icon" />
                    Business Name <span className="required">*</span>
                  </label>
                  <div className="field-input-wrapper">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Acme Inc."
                      required
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    <FaEnvelope className="field-icon" />
                    Email Address <span className="required">*</span>
                  </label>
                  <div className="field-input-wrapper">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@company.com"
                      required
                      className="field-input"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">
                    <FaLock className="field-icon" />
                    Password <span className="required">*</span>
                  </label>
                  <div className="field-input-wrapper password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
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

                <div className="form-field">
                  <label className="field-label">
                    <FaLock className="field-icon" />
                    Confirm Password <span className="required">*</span>
                  </label>
                  <div className="field-input-wrapper password-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      className="field-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Phone & Industry */}
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">
                    <FaPhone className="field-icon" />
                    Phone Number <span className="required">*</span>
                  </label>
                  <div className="field-input-wrapper">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                      required
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    <FaBuilding className="field-icon" />
                    Industry <span className="required">*</span>
                  </label>
                  <div className="field-input-wrapper">
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="field-input field-select"
                      required
                    >
                      {industries.map(ind => (
                        <option key={ind.value} value={ind.value}>
                          {ind.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="address-section">
                <label className="field-label address-label">
                  <FaMapPin className="field-icon" />
                  Business Address <span className="optional">(Optional)</span>
                </label>
                <div className="address-grid">
                  <div className="address-field full-width">
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      placeholder="Street address"
                      className="field-input"
                    />
                  </div>
                  <div className="address-field">
                    <FaCity className="address-icon" />
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="field-input address-input"
                    />
                  </div>
                  <div className="address-field">
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="field-input"
                    />
                  </div>
                  <div className="address-field">
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      placeholder="Zip Code"
                      className="field-input"
                    />
                  </div>
                  <div className="address-field full-width">
                    <FaGlobe className="address-icon" />
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className="field-input address-input"
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="terms-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="terms-text">
                    I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and 
                    <Link to="/privacy" className="terms-link"> Privacy Policy</Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="signup-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <FaArrowRight className="btn-arrow" />
                  </>
                )}
              </button>
            </motion.form>

            {/* Footer */}
            <div className="form-footer">
              <p>
                Already have an account? <Link to="/login" className="signin-link">Sign In</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;












// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding, FaArrowRight } from 'react-icons/fa';
// import { register } from '../services/api';

// const SignupPage = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     phone: '',
//     industry: 'technology',
//     address: {
//       street: '',
//       city: '',
//       state: '',
//       zipCode: '',
//       country: ''
//     }
//   });

//   const industries = [
//     { value: 'bank', label: '🏦 Banking' },
//     { value: 'school', label: '🏫 School' },
//     { value: 'hotel', label: '🏨 Hotel' },
//     { value: 'ecommerce', label: '🛍️ E-commerce' },
//     { value: 'immigration', label: '🌍 Immigration' },
//     { value: 'technology', label: '💻 Technology' },
//     { value: 'healthcare', label: '🏥 Healthcare' },
//     { value: 'realestate', label: '🏠 Real Estate' },
//     { value: 'other', label: '📌 Other' }
//   ];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name.includes('.')) {
//       const [parent, child] = name.split('.');
//       setFormData(prev => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value
//         }
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validation
//     if (!formData.name || !formData.email || !formData.password || !formData.phone) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     if (formData.password.length < 6) {
//       toast.error('Password must be at least 6 characters');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Prepare data for API
//       const businessData = {
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//         phone: formData.phone,
//         industry: formData.industry,
//         address: formData.address
//       };

//       console.log('📝 Registering business:', businessData);
      
//       const response = await register(businessData);
      
//       console.log('✅ Registration response:', response.data);
      
//       if (response.data && response.data.success) {
//         const { token, business } = response.data.data;
        
//         // Store token and business data
//         localStorage.setItem('token', token);
//         localStorage.setItem('businessId', business.id);
//         localStorage.setItem('user', JSON.stringify(business));
        
//         toast.success('Account created successfully!');
        
//         // Navigate to dashboard
//         setTimeout(() => {
//           navigate('/dashboard');
//         }, 1000);
//       } else {
//         toast.error(response.data?.error || 'Registration failed');
//       }
//     } catch (error) {
//       console.error('Registration error:', error);
//       const errorMessage = error.response?.data?.error || error.message || 'Registration failed. Please try again.';
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page signup-page">
//       <div className="auth-container">
//         <div className="auth-header">
//           <div className="auth-logo">
//             <span className="logo-icon">🤖</span>
//             <h1>AI Support</h1>
//           </div>
//           <h2>Create Your Account</h2>
//           <p>Start your 14-day free trial today</p>
//         </div>

//         <form onSubmit={handleSubmit} className="auth-form">
//           <div className="form-row">
//             <div className="form-group">
//               <label>
//                 <FaBuilding className="input-icon" />
//                 Business Name <span className="required">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Enter business name"
//                 required
//                 className="form-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>
//                 <FaEnvelope className="input-icon" />
//                 Email Address <span className="required">*</span>
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Enter email address"
//                 required
//                 className="form-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>
//                 <FaLock className="input-icon" />
//                 Password <span className="required">*</span>
//               </label>
//               <input
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Min 6 characters"
//                 required
//                 className="form-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>
//                 <FaLock className="input-icon" />
//                 Confirm Password <span className="required">*</span>
//               </label>
//               <input
//                 type="password"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 placeholder="Confirm your password"
//                 required
//                 className="form-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>
//                 <FaPhone className="input-icon" />
//                 Phone Number <span className="required">*</span>
//               </label>
//               <input
//                 type="tel"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 placeholder="+1 234 567 8900"
//                 required
//                 className="form-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>
//                 <FaBuilding className="input-icon" />
//                 Industry <span className="required">*</span>
//               </label>
//               <select
//                 name="industry"
//                 value={formData.industry}
//                 onChange={handleChange}
//                 className="form-select"
//                 required
//               >
//                 {industries.map(ind => (
//                   <option key={ind.value} value={ind.value}>
//                     {ind.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="form-group">
//             <label>Business Address (Optional)</label>
//             <div className="address-fields">
//               <input
//                 type="text"
//                 name="address.street"
//                 value={formData.address.street}
//                 onChange={handleChange}
//                 placeholder="Street address"
//                 className="form-input"
//               />
//               <div className="address-row">
//                 <input
//                   type="text"
//                   name="address.city"
//                   value={formData.address.city}
//                   onChange={handleChange}
//                   placeholder="City"
//                   className="form-input"
//                 />
//                 <input
//                   type="text"
//                   name="address.state"
//                   value={formData.address.state}
//                   onChange={handleChange}
//                   placeholder="State"
//                   className="form-input"
//                 />
//                 <input
//                   type="text"
//                   name="address.zipCode"
//                   value={formData.address.zipCode}
//                   onChange={handleChange}
//                   placeholder="Zip Code"
//                   className="form-input"
//                 />
//               </div>
//               <input
//                 type="text"
//                 name="address.country"
//                 value={formData.address.country}
//                 onChange={handleChange}
//                 placeholder="Country"
//                 className="form-input"
//               />
//             </div>
//           </div>

//           <button type="submit" className="btn-primary auth-btn" disabled={loading}>
//             {loading ? (
//               <>
//                 <span className="spinner"></span> Creating Account...
//               </>
//             ) : (
//               <>
//                 Create Account <FaArrowRight />
//               </>
//             )}
//           </button>
//         </form>

//         <div className="auth-footer">
//           <p>
//             Already have an account? <Link to="/login">Sign In</Link>
//           </p>
//           <p className="auth-terms">
//             By signing up, you agree to our Terms of Service and Privacy Policy
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignupPage;