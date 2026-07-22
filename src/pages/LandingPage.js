import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';


const LandingPage = () => {
  useEffect(() => {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
      if (window.pageYOffset > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    const toggleMenu = () => {
      menuToggle?.classList.toggle('active');
      navLinks?.classList.toggle('open');
    };

    menuToggle?.addEventListener('click', toggleMenu);

    // Close menu on link click
    navLinks?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle?.classList.remove('active');
        navLinks?.classList.remove('open');
      });
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      menuToggle?.removeEventListener('click', toggleMenu);
    };
  }, []);

  return (
    <>
      {/* ============================================
      NAVBAR
      ============================================ */}
      <nav className="navbar" id="navbar">
        <div className="container">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">🤖</span>
            <span>AI Support</span>
          </Link>

          <ul className="nav-links" id="navLinks">
            <li><a href="#features">Features</a></li>
            <li><a href="#industries">Industries</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><Link to="/login" className="btn btn-primary btn-sm">Login</Link></li>
            <li><Link to="/signup" className="btn btn-gradient btn-sm">Get Started</Link></li>
          </ul>

          <button className="menu-toggle" id="menuToggle" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* ============================================
      HERO SECTION
      ============================================ */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-content">
            <h1>
              AI Customer Support<br />
              <span className="highlight">24/7 Automated</span>
            </h1>
            <p>
              Let your AI agent handle customer inquiries, collect leads, and escalate complex issues — all while you sleep. Perfect for banks, schools, hotels, e-commerce, and immigration agencies.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-gradient btn-lg">Start Free Trial</Link>
              <a href="#features" className="btn btn-outline btn-lg">Learn More</a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <h3>24/7</h3>
                <p>Always available</p>
              </div>
              <div className="stat">
                <h3>95%</h3>
                <p>Response accuracy</p>
              </div>
              <div className="stat">
                <h3>85%</h3>
                <p>Lead capture rate</p>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <div className="hero-illustration">
              <div className="chat-bubble">
                <div className="chat-header">
                  <div className="chat-avatar">👤</div>
                  <span className="chat-name">Customer</span>
                  <span className="chat-time">now</span>
                </div>
                <div className="chat-text">How do I reset my password?</div>
              </div>
              <div className="chat-bubble">
                <div className="chat-header">
                  <div className="chat-avatar">🤖</div>
                  <span className="chat-name">AI Assistant</span>
                  <span className="chat-time">now</span>
                </div>
                <div className="chat-text ai">I can help with that! Let me guide you through the process.</div>
              </div>
              <div className="chat-bubble">
                <div className="chat-header">
                  <div className="chat-avatar">👤</div>
                  <span className="chat-name">Customer</span>
                  <span className="chat-time">now</span>
                </div>
                <div className="chat-text">Thank you! That was quick.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
      INDUSTRIES SECTION
      ============================================ */}
      <section className="industries" id="industries">
        <div className="container">
          <div className="section-header">
            <h2>Trusted by Businesses Across Industries</h2>
            <p>Our AI support agent works for businesses of all sizes and sectors.</p>
          </div>
          <div className="industries-grid">
            <div className="industry-card">
              <div className="icon">🏦</div>
              <h4>Banks</h4>
            </div>
            <div className="industry-card">
              <div className="icon">🏫</div>
              <h4>Schools</h4>
            </div>
            <div className="industry-card">
              <div className="icon">🏨</div>
              <h4>Hotels</h4>
            </div>
            <div className="industry-card">
              <div className="icon">🛍️</div>
              <h4>E-commerce</h4>
            </div>
            <div className="industry-card">
              <div className="icon">🌍</div>
              <h4>Immigration</h4>
            </div>
            <div className="industry-card">
              <div className="icon">💻</div>
              <h4>Technology</h4>
            </div>
            <div className="industry-card">
              <div className="icon">🏥</div>
              <h4>Healthcare</h4>
            </div>
            <div className="industry-card">
              <div className="icon">🏠</div>
              <h4>Real Estate</h4>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
      FEATURES SECTION
      ============================================ */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need for Intelligent Customer Support</h2>
            <p>AI-powered features that transform how you handle customer interactions.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="icon">🤖</div>
              <h3>AI-Powered Responses</h3>
              <p>Intelligent, context-aware responses trained on your business documents and FAQs.</p>
            </div>
            <div className="feature-card">
              <div className="icon">📱</div>
              <h3>Multi-Channel Support</h3>
              <p>Connect with customers on WhatsApp, Telegram, Web Chat, and Email.</p>
            </div>
            <div className="feature-card">
              <div className="icon">🎯</div>
              <h3>Lead Capture</h3>
              <p>Automatically capture and manage leads from conversations.</p>
            </div>
            <div className="feature-card">
              <div className="icon">📊</div>
              <h3>Analytics Dashboard</h3>
              <p>Real-time insights into conversations, sentiment, and team performance.</p>
            </div>
            <div className="feature-card">
              <div className="icon">📄</div>
              <h3>Document Management</h3>
              <p>Upload and manage knowledge base documents for accurate AI responses.</p>
            </div>
            <div className="feature-card">
              <div className="icon">🔒</div>
              <h3>Enterprise Security</h3>
              <p>End-to-end encryption, GDPR compliant, and role-based access control.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
      HOW IT WORKS
      ============================================ */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in minutes — no technical expertise required.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload Documents</h3>
              <p>Upload your FAQs, policies, and product information.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Connect Channels</h3>
              <p>Link WhatsApp, Telegram, or Email in one click.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Launch Your AI Agent</h3>
              <p>Start receiving and responding to customer inquiries automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
      TESTIMONIALS
      ============================================ */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Customers Say</h2>
            <p>Real feedback from businesses using AI Customer Support.</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <blockquote>"This AI agent has saved us over 20 hours a week. Our customers love the instant responses!"</blockquote>
              <div className="author">
                <div className="author-avatar">JD</div>
                <div className="author-info">
                  <h4>John Doe</h4>
                  <p>CEO, TechStart Inc.</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <blockquote>"We've captured 3x more leads since implementing the AI agent. It's a game-changer."</blockquote>
              <div className="author">
                <div className="author-avatar">SM</div>
                <div className="author-info">
                  <h4>Sarah Miller</h4>
                  <p>Marketing Director, GrowFast</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <blockquote>"Our support team is now focused on complex issues while the AI handles the rest."</blockquote>
              <div className="author">
                <div className="author-avatar">RK</div>
                <div className="author-info">
                  <h4>Rahul Kumar</h4>
                  <p>Head of Support, ServiceHub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
      PRICING
      ============================================ */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Simple, Transparent Pricing</h2>
            <p>Choose the plan that fits your business needs.</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Basic</h3>
              <div className="price">$29 <span>/mo</span></div>
              <p className="description">Perfect for small businesses getting started.</p>
              <ul className="features-list">
                <li><span className="check">✓</span> 1,000 conversations/month</li>
                <li><span className="check">✓</span> 1 team member</li>
                <li><span className="check">✓</span> Email support</li>
                <li><span className="check">✓</span> Basic analytics</li>
              </ul>
              <Link to="/signup" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Get Started</Link>
            </div>

            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <h3>Pro</h3>
              <div className="price">$99 <span>/mo</span></div>
              <p className="description">Ideal for growing businesses.</p>
              <ul className="features-list">
                <li><span className="check">✓</span> 10,000 conversations/month</li>
                <li><span className="check">✓</span> 5 team members</li>
                <li><span className="check">✓</span> Priority support</li>
                <li><span className="check">✓</span> Advanced analytics</li>
                <li><span className="check">✓</span> WhatsApp & Telegram integration</li>
                <li><span className="check">✓</span> Lead capture</li>
              </ul>
              <Link to="/signup" className="btn btn-gradient" style={{ width: '100%', justifyContent: 'center' }}>Get Started</Link>
            </div>

            <div className="pricing-card">
              <h3>Enterprise</h3>
              <div className="price">Custom</div>
              <p className="description">For large organizations with specific needs.</p>
              <ul className="features-list">
                <li><span className="check">✓</span> Unlimited conversations</li>
                <li><span className="check">✓</span> Unlimited team members</li>
                <li><span className="check">✓</span> Dedicated support</li>
                <li><span className="check">✓</span> Custom integrations</li>
                <li><span className="check">✓</span> On-premise deployment</li>
                <li><span className="check">✓</span> Custom SLA</li>
              </ul>
              <a href="#cta" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
      CTA SECTION
      ============================================ */}
      <section className="cta" id="cta">
        <div className="container">
          <h2>Ready to Automate Your Customer Support?</h2>
          <p>Join thousands of businesses already using AI to deliver exceptional customer experiences 24/7.</p>
          <Link to="/signup" className="btn btn-secondary btn-lg">Start Your Free Trial</Link>
        </div>
      </section>

      {/* ============================================
      FOOTER
      ============================================ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3>🤖 AI Support</h3>
              <p>Intelligent customer support automation for businesses of all sizes.</p>
            </div>
            <div className="footer-links">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#">Documentation</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 AI Support. All rights reserved.</span>
            <div className="footer-socials">
              <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              <a href="#" aria-label="GitHub"><i className="fab fa-github"></i></a>
              <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;