// main.js - Core application logic and header rendering

const navTemplate = `
<div class="nav-container container">
  <a href="/" class="logo-container">
    <div class="logo-box">GR</div>
    <div class="logo-text">
      <span class="logo-main">Great Rift</span>
      <span class="logo-sub">Shuttle SACCO</span>
    </div>
  </a>
  
  <nav class="nav-links">
    <a href="/" class="nav-link">Home</a>
    <a href="/routes.html" class="nav-link">Routes</a>
    <a href="/book.html" class="nav-link">Book a Trip</a>
    <a href="/parcel.html" class="nav-link">Send Parcel</a>
    <a href="/track.html" class="nav-link">Track</a>
    <a href="/about.html" class="nav-link">About</a>
  </nav>

  <div class="nav-ctas flex items-center gap-4">
    <a href="/track.html" class="btn btn-outline py-2 px-4 h-10 hidden lg:flex">Track Parcel</a>
    <a href="/auth.html" class="btn btn-primary py-2 px-6 h-10 shadow-md">My Account</a>
    
    <button class="mobile-toggle lg:hidden" aria-label="Toggle Menu">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </button>
  </div>
</div>

<div class="mobile-drawer">
  <div class="drawer-content">
    <a href="/" class="drawer-link">Home</a>
    <a href="/routes.html" class="drawer-link">Routes</a>
    <a href="/book.html" class="drawer-link">Book a Trip</a>
    <a href="/parcel.html" class="drawer-link">Send Parcel</a>
    <a href="/track.html" class="drawer-link">Track Parcel</a>
    <hr>
    <a href="/auth.html" class="drawer-link">Login / Account</a>
    <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
      <a href="/book.html" class="btn btn-primary w-full">Book a Trip</a>
      <a href="/parcel.html" class="btn btn-accent w-full">Send Parcel</a>
    </div>
  </div>
</div>
`;

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (header) {
    header.innerHTML = navTemplate;
    
    // Mobile Drawer Logic
    const toggle = header.querySelector('.mobile-toggle');
    const drawer = header.querySelector('.mobile-drawer');
    
    toggle?.addEventListener('click', () => {
      toggle.classList.toggle('active');
      drawer?.classList.toggle('open');
      document.body.classList.toggle('no-scroll');
    });

    // Scroll Effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Mark current page active
    const currentPath = window.location.pathname;
    header.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      }
    });
  }

  const footer = document.querySelector('footer');
  if (footer && !footer.innerHTML.trim()) {
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="logo-text mb-6">
              <span class="logo-main text-white" style="font-size: 1.5rem">Great Rift</span>
              <span class="logo-sub text-white/60">Shuttle SACCO</span>
            </div>
            <p class="text-sm opacity-80 mb-8 max-w-xs">Connecting Kenya with safety, reliability and efficiency. The leading shuttle service in the Great Rift Valley.</p>
            <div class="social-links flex gap-4">
              <span class="p-2 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors">FB</span>
              <span class="p-2 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors">TW</span>
              <span class="p-2 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors">IG</span>
            </div>
          </div>
          
          <div class="footer-links">
            <h4 class="text-white mb-6 uppercase text-xs font-bold tracking-widest">Travel & Shippings</h4>
            <ul class="space-y-3 text-sm opacity-80">
              <li><a href="/book.html" class="hover:text-white transition-colors">Book a Trip</a></li>
              <li><a href="/parcel.html" class="hover:text-white transition-colors">Parcel Delivery</a></li>
              <li><a href="/freight.html" class="hover:text-white transition-colors">Freight & Cargo</a></li>
              <li><a href="/charter.html" class="hover:text-white transition-colors">Charter Hire</a></li>
              <li><a href="/track.html" class="hover:text-white transition-colors">Track Shipment</a></li>
            </ul>
          </div>

          <div class="footer-links">
            <h4 class="text-white mb-6 uppercase text-xs font-bold tracking-widest">Company</h4>
            <ul class="space-y-3 text-sm opacity-80">
              <li><a href="/about.html" class="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact.html" class="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="/agent/index.html" class="hover:text-white transition-colors">Agent Portal</a></li>
              <li><a href="/careers" class="hover:text-white transition-colors">Careers</a></li>
              <li><a href="/terms" class="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div class="footer-links">
            <h4 class="text-white mb-6 uppercase text-xs font-bold tracking-widest">Head Office</h4>
            <p class="text-sm opacity-80 mb-4">Great Rift Plaza, Uganda Road<br>Eldoret, Kenya</p>
            <p class="text-sm opacity-80 mb-2">P: +254 700 000 000</p>
            <p class="text-sm opacity-80">E: info@greatriftshuttle.co.ke</p>
          </div>
        </div>
        
        <div class="footer-bottom border-t border-white/10 mt-16 pt-8 flex justify-between items-center text-xs opacity-60">
          <p>&copy; 2026 Great Rift Shuttle SACCO. All Rights Reserved.</p>
          <div class="flex gap-8">
            <a href="#">Privacy Policy</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    `;
  }
});
