/**
 * Great Rift Shuttle - Core Application Logic
 * Handles Authentication, API wrappers, and Global UI interactions.
 */

// Centralized API utility for handling HTTP requests with error validation.
export const api = {
  get: async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown Error' }));
        throw new Error(error.error || 'Request failed');
    }
    return res.json();
  },
  post: async (url, data) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Unknown Error' }));
        throw new Error(error.error || 'Request failed');
    }
    return res.json();
  }
};

// Manages the global authentication state UI (navbar, menus) and role-based routing.
export function setupAuth() {
  const user = JSON.parse(localStorage.getItem('user'));
  const loginBtn = document.getElementById('nav-login');
  const userMenu = document.getElementById('user-menu');
  const logoutBtn = document.getElementById('logout-btn');
  
  // Mobile elements
  const mobileAuth = document.getElementById('mobile-auth-section');
  const mobileUser = document.getElementById('mobile-user-section');
  const mobileLogout = document.getElementById('mobile-logout-btn');

  if (user) {
    if (loginBtn) loginBtn.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
    if (mobileAuth) mobileAuth.classList.add('hidden');
    if (mobileUser) mobileUser.classList.remove('hidden');

    // Update dashboard links based on role
    const dashboardPath = user.role === 'admin' ? '/admin.html' : 
                          user.role === 'driver' ? '/driver_dashboard.html' :
                          user.role === 'clerk' ? '/clerk_dashboard.html' : '/dashboard.html';
    
    document.querySelectorAll('a[href="/dashboard.html"]').forEach(link => {
      link.href = dashboardPath;
    });

    const handleLogout = () => {
      localStorage.removeItem('user');
      window.location.reload();
    };

    if (logoutBtn) logoutBtn.onclick = handleLogout;
    if (mobileLogout) mobileLogout.onclick = handleLogout;

  } else {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
    if (mobileAuth) mobileAuth.classList.remove('hidden');
    if (mobileUser) mobileUser.classList.add('hidden');
  }

  // Mobile Responsive Menu Navigation Logic
  const mobileMenu = document.getElementById('mobile-menu');
  const openBtn = document.getElementById('mobile-menu-open');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (mobileMenu && openBtn && closeBtn) {
    const toggleMenu = (open) => {
      if (open) {
        mobileMenu.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden';
      } else {
        mobileMenu.classList.add('translate-x-full');
        document.body.style.overflow = '';
      }
    };

    openBtn.onclick = () => toggleMenu(true);
    closeBtn.onclick = () => toggleMenu(false);
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
  setupAuth();
});
