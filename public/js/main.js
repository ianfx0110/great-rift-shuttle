// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Navigation Toggle
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('navMenu');
const overlay = document.getElementById('navOverlay');

if (toggle) {
    toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        overlay.classList.toggle('visible', open);
        toggle.setAttribute('aria-expanded', open);
        toggle.classList.toggle('is-open', open);
    });
}

if (overlay) {
    overlay.addEventListener('click', () => {
        menu.classList.remove('open');
        overlay.classList.remove('visible');
        toggle.setAttribute('aria-expanded', false);
        toggle.classList.remove('is-open');
    });
}

// Scrolled Class
window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (header) {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }
});

// Scroll Reveal Animation
const revealOnScroll = () => {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const IsVisible = rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85;
        if (IsVisible) {
            el.classList.add('visible');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Initial check

// Toast Notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

// Expose to window
window.showToast = showToast;
