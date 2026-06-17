import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import profileImg from './assets/profile.png';
import logoImg from './assets/logo.png';
import MouseTrail from './MouseTrail';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef(null);

  // Theme toggle state
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isThemeHovering, setIsThemeHovering] = useState(false);
  const [themeMousePos, setThemeMousePos] = useState({ x: 0, y: 0 });
  const themeWrapperRef = useRef(null);

  // Logo state
  const [isLogoHovering, setIsLogoHovering] = useState(false);
  const [logoMousePos, setLogoMousePos] = useState({ x: 0, y: 0 });
  const logoWrapperRef = useRef(null);

  // Menu Inversion state for white section
  const [isMenuInverted, setIsMenuInverted] = useState(false);

  useEffect(() => {
    // Apply theme to document body
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  const handleMouseMove = (e) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const handleThemeMouseMove = (e) => {
    if (!themeWrapperRef.current) return;
    const rect = themeWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setThemeMousePos({ x, y });
  };

  // Parallax Scroll State (Professional: Fade & translateY only)
  const mainContentRef = useRef(null);
  const sidebarRef = useRef(null);
  
  // Horizontal Scroll State
  const servicesSectionRef = useRef(null);
  const servicesScrollRef = useRef(null);
  const trackRef = useRef(null);
  
  // Smooth Lerp State for horizontal scroll
  const targetTranslate = useRef(0);
  const currentTranslate = useRef(0);

  useEffect(() => {
    // Render loop for buttery smooth horizontal scrolling independent of strict scroll ticks
    let animationFrameId;
    const renderLoop = (time) => {
      // Lerp (Linear Interpolation) for flowing, strike-like horizontal scroll
      currentTranslate.current += (targetTranslate.current - currentTranslate.current) * 0.08;
      
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${currentTranslate.current}px)`;
      }
      
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Hero Parallax
      if (scrollY <= windowHeight) {
        const progress = scrollY / windowHeight;
        const yOffset = scrollY * 0.35; 
        const opacity = Math.max(1 - (progress * 1.5), 0); 
        
        if (mainContentRef.current) {
          mainContentRef.current.style.transform = `translateY(${yOffset}px)`;
          mainContentRef.current.style.opacity = opacity;
        }
        
        if (sidebarRef.current) {
          sidebarRef.current.style.transform = `translateY(calc(-50% + ${yOffset}px)) rotate(180deg)`;
          sidebarRef.current.style.opacity = opacity;
        }
      }
      
      // Check if header is overlapping the white Services section
      if (servicesSectionRef.current) {
        const rect = servicesSectionRef.current.getBoundingClientRect();
        // Header height is roughly ~80px. Check if it's within the section bounds.
        const isOverWhite = rect.top <= 80 && rect.bottom >= 80;
        setIsMenuInverted(isOverWhite);
      }
      
      // Horizontal Scroll Target Calculation
      if (servicesScrollRef.current && trackRef.current) {
         const rect = servicesScrollRef.current.getBoundingClientRect();
         
         if (rect.top <= 0 && rect.bottom >= windowHeight) {
           const scrolledPast = -rect.top;
           const maxScroll = servicesScrollRef.current.offsetHeight - windowHeight;
           
           // Calculate how far to translate to reach the end of the track
           const maxTranslate = trackRef.current.scrollWidth - window.innerWidth + 64; // 64px buffer
           
           const progress = scrolledPast / maxScroll;
           targetTranslate.current = progress * maxTranslate;
           
         } else if (rect.top > 0) {
           targetTranslate.current = 0;
         } else if (rect.bottom < windowHeight) {
           const maxTranslate = trackRef.current.scrollWidth - window.innerWidth + 64;
           targetTranslate.current = maxTranslate;
         }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to set initial states
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="app-wrapper">
      {/* Gooey Filter Definition */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>

      {/* Header Area (Logo, Menu, & Theme Toggle) */}
      <header className={`header-bar ${isMenuInverted ? 'invert-menu' : ''}`}>
        {/* Left: Logo */}
        <div className="logo-wrapper">
          <div className="content-layer logo-content">
            {/* The user will send a dark logo for light mode later. For now, we temporarily invert the white logo in light mode to keep it visible, but no liquid background! */}
            <img src={logoImg} alt="Omer J. Logo" className={`logo-image ${!isDarkMode ? 'temp-invert' : ''} ${isMenuInverted ? 'force-dark-logo' : ''}`} />
          </div>
        </div>

        {/* Center: Top Menu Area */}
        <div 
          className={`top-menu-wrapper ${isMenuOpen ? 'open' : ''}`}
          ref={wrapperRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Layer 1: Gooey Background Bubbles */}
          <div className="gooey-bg-layer">
            <div className="bg-bubble main-bg"></div>
            <div className="bg-bubble drip-bg"></div>
            
            {/* Custom Liquid Cursor */}
            <div 
              className={`cursor-blob ${isHovering ? 'active' : ''}`}
              style={{ transform: `translate(${mousePos.x - 15}px, ${mousePos.y - 15}px)` }}
            ></div>
          </div>

          {/* Layer 2: Crisp Content */}
          <div className="content-layer">
            <div className="main-content-hitbox" onClick={() => !isMenuOpen && setIsMenuOpen(true)}>
              <div className="premium-hamburger">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M4 8h16M4 16h10"/>
                </svg>
              </div>
              
              <nav className="nav-links">
                <a href="#work">Work</a>
                <a href="#services">Services</a>
                <a href="#about">About</a>
              </nav>
            </div>

            <div className="drip-content-hitbox" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Right: Theme Toggle with Liquid Glass */}
        <div 
          className="theme-toggle-wrapper"
          ref={themeWrapperRef}
          onMouseEnter={() => setIsThemeHovering(true)}
          onMouseLeave={() => setIsThemeHovering(false)}
          onMouseMove={handleThemeMouseMove}
        >
          <div className="gooey-bg-layer">
            <div className="bg-bubble theme-bg"></div>
            {/* Custom Liquid Cursor for Theme */}
            <div 
              className={`cursor-blob ${isThemeHovering ? 'active' : ''}`}
              style={{ transform: `translate(${themeMousePos.x - 15}px, ${themeMousePos.y - 15}px)` }}
            ></div>
          </div>
          <div className="content-layer">
            <div className="theme-hitbox" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Parallax Effect */}
      <div className="hero-container">
        <MouseTrail />
        {/* Sidebar Text */}
        <div className="sidebar" ref={sidebarRef}>
          <span className="sidebar-text uppercase tracking">Product designer</span>
          <span className="sidebar-text tracking">2024</span>
        </div>

        <div className="main-content" ref={mainContentRef}>
          {/* Left Column */}
          <div className="left-col">
            {/* Hero Text */}
            <div className="hero-text-container fade-in-up delay-2">
              <h1 className="hero-title">
                <div className="title-line-1">
                  <span>WE</span>
                  <span className="pill-text">CREATE</span>
                </div>
                <div className="title-line-2">DIGITAL</div>
                <div className="title-line-3">SOLUTIONS</div>
              </h1>
              <p className="hero-subtitle mt-8">
                <span className="dash"></span>
                <span>
                  I’m Omer J.<br />
                  your all-in-one<br />
                  website designer
                </span>
              </p>
            </div>

            {/* Bottom Area: Stats & Scroll */}
            <div className="bottom-info">
              <div className="stats-container fade-in-up delay-1">
                <div className="stat-item">
                  <h3 className="stat-value"><span className="plus">+</span>600</h3>
                  <p className="stat-label">Project completed</p>
                </div>
                <div className="stat-item">
                  <h3 className="stat-value"><span className="plus">+</span>50</h3>
                  <p className="stat-label">Startup raised</p>
                </div>
              </div>

              <div className="scroll-down fade-in-up delay-3">
                <a href="#services" className="scroll-link">
                  Scroll down <span>↓</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-col fade-in-up delay-4">
            <img 
              src={profileImg} 
              alt="D.Nova Portrait" 
              className="profile-image"
            />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="services-section" ref={servicesSectionRef}>
        
        {/* Intro Grid */}
        <div className="services-intro-grid">
          <div className="services-keywords fade-in-up delay-1">
            <ul>
              <li>Perform</li>
              <li>Convert</li>
              <li>Last</li>
            </ul>
          </div>
          <div className="services-headline fade-in-up delay-2">
            <h2>
              I don't just hand you a website and disappear. Every project is a tailored solution — built to perform, built to convert, and built to last.
            </h2>
          </div>
        </div>

        {/* Horizontal Scrolling Cards mapped to Vertical Scroll */}
        <div className="horizontal-scroll-wrapper fade-in-up delay-3" ref={servicesScrollRef}>
          <div className="sticky-horizontal-container">
            <div className="services-cards-track" ref={trackRef}>
            
            <div className="service-card">
              <div className="card-top">
                <span className="card-number">01</span>
                <h3>WordPress Website Design & Development</h3>
              </div>
              <p className="card-desc">Custom WordPress websites designed from the ground up. No bloated templates, no copy-paste layouts. I build fast, clean, and visually sharp sites using Elementor and custom code — exactly the way your brand deserves.</p>
              <div className="card-included"><strong>What's included:</strong> Custom UI/UX design, mobile responsiveness, speed optimisation, contact forms, and on-page SEO setup.</div>
            </div>

            <div className="service-card">
              <div className="card-top">
                <span className="card-number">02</span>
                <h3>WooCommerce & E-Commerce Development</h3>
              </div>
              <p className="card-desc">Ready to sell online? I build WooCommerce stores that are easy to manage and built to drive sales — with clean product layouts, smooth checkout flows, and everything set up so your customers trust you from the first click.</p>
              <div className="card-included"><strong>What's included:</strong> Product setup, payment gateway integration, cart & checkout customisation, and shipping configuration.</div>
            </div>

            <div className="service-card">
              <div className="card-top">
                <span className="card-number">03</span>
                <h3>Custom Theme & Plugin Development</h3>
              </div>
              <p className="card-desc">When off-the-shelf tools don't cut it, I build from scratch. Using PHP, JavaScript, and MySQL, I develop custom WordPress themes and plugins tailored to your exact requirements — no workarounds, no compromises.</p>
              <div className="card-included"><strong>What's included:</strong> Custom theme architecture, bespoke plugin functionality, and full code documentation.</div>
            </div>

            <div className="service-card">
              <div className="card-top">
                <span className="card-number">04</span>
                <h3>UI/UX Design (Figma)</h3>
              </div>
              <p className="card-desc">Before a single line of code is written, I design the full experience in Figma. Clean wireframes, polished mockups, and interactive prototypes — so you see exactly what you're getting before we build.</p>
              <div className="card-included"><strong>What's included:</strong> Wireframing, full UI design, component library, and handoff-ready Figma files.</div>
            </div>

            <div className="service-card">
              <div className="card-top">
                <span className="card-number">05</span>
                <h3>Webflow & Framer Development</h3>
              </div>
              <p className="card-desc">Not a WordPress project? No problem. I build high-performance marketing sites and portfolios on Webflow and Framer — pixel-perfect design with smooth animations and zero technical debt.</p>
              <div className="card-included"><strong>What's included:</strong> Responsive layout, CMS setup, animations, and custom interactions.</div>
            </div>

            <div className="service-card">
              <div className="card-top">
                <span className="card-number">06</span>
                <h3>Shopify Store Development</h3>
              </div>
              <p className="card-desc">For businesses that need a rock-solid e-commerce foundation, I build and customise Shopify stores — from theme setup and product organisation to app integrations and conversion-focused design.</p>
              <div className="card-included"><strong>What's included:</strong> Theme customisation, product & collection setup, app integration, and store launch.</div>
            </div>

            <div className="service-card">
              <div className="card-top">
                <span className="card-number">07</span>
                <h3>SEO-Optimised Website Setup</h3>
              </div>
              <p className="card-desc">A beautiful website means nothing if no one finds it. Every site I build includes foundational SEO — proper heading structure, meta tags, fast load times, clean URLs, and schema markup — so you start ranking from day one.</p>
              <div className="card-included"><strong>What's included:</strong> On-page SEO, meta descriptions, SEO titles, image optimisation, and sitemap/robots.txt setup.</div>
            </div>

            <div className="service-card">
              <div className="card-top">
                <span className="card-number">08</span>
                <h3>Website Redesign & Migration</h3>
              </div>
              <p className="card-desc">Stuck with an outdated site or a platform that no longer fits? I handle full redesigns and migrations — preserving your content and SEO while giving your business a clean, modern upgrade.</p>
              <div className="card-included"><strong>What's included:</strong> Design refresh, platform migration, redirect setup, and performance improvements.</div>
            </div>

            <div className="service-card feature-card">
              <div className="card-top">
                <span className="card-number">09</span>
                <h3>Vibe Coding — Vite & Full Stack Web Apps</h3>
              </div>
              <p className="card-desc">Got an idea that goes beyond a brochure site? I build fast, modern web applications using Vite, React, and Node.js — from concept to deployment. Whether it's a SaaS tool, internal dashboard, booking system, or a custom web app, I bring it to life with clean code and a sharp UI.</p>
              <p className="card-desc">This is vibe coding done right — AI-assisted, rapidly built, but properly structured so it doesn't fall apart the moment someone actually uses it.</p>
              <div className="card-included"><strong>What's included:</strong> Frontend development with React + Vite, backend API with Node.js/Express, database integration (MySQL or Supabase), authentication, deployment on Vercel/Railway/VPS, and full handoff with documentation.</div>
            </div>

            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="services-footer fade-in-up delay-4">
          <div className="services-footer-text">
            <h3>Not Sure Which Service You Need?</h3>
            <p>Book a free discovery call and I'll tell you exactly what your business needs — no fluff, no hard sell.</p>
          </div>
          <button className="book-call-btn">
            <div className="btn-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animated-arrow">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
            <span className="btn-text">Book a Free Call</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;
