// script.js - Main application script for CareConnect

document.addEventListener('DOMContentLoaded', function() {
    console.log('CareConnect application loaded!');
    
    // Check if user is logged in and update navigation
    updateNavigation();
    
    // Handle URL parameters for signup tab switching
    handleSignupTabParam();
    
    // Initialize page-specific functionality
    initializePageFeatures();
});

// Update navigation based on login status
function updateNavigation() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const navbar = document.querySelector('.nav-links');
    
    if (!navbar) return;
    
    if (currentUser) {
        console.log('User is logged in:', currentUser.name);
        
        // Replace login/signup with dashboard and logout
        const dashboardUrl = getDashboardUrl(currentUser.userType);
        
        navbar.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="donate.html">Donate</a></li>
            <li><a href="volunteer.html">Volunteer</a></li>
            <li><a href="ngo.html">NGO</a></li>
            <li><a href="${dashboardUrl}">Dashboard</a></li>
            <li><a href="#" onclick="logout()" class="logout-link">Logout</a></li>
        `;
        
        // Add user indicator
        const userIndicator = document.createElement('div');
        userIndicator.className = 'user-indicator';
        userIndicator.innerHTML = `
            <span class="user-name">Welcome, ${currentUser.name}</span>
            <span class="user-type">${getUserTypeLabel(currentUser.userType)}</span>
        `;
        navbar.appendChild(userIndicator);
    } else {
        console.log('User is not logged in');
        // Default navigation (already set in HTML)
    }
}

// Get dashboard URL based on user type
function getDashboardUrl(userType) {
    const dashboardUrls = {
        donor: '/Common frontend HTML/donor-dashboard.html',
        volunteer: '/Common frontend HTML/volunteer-dashboard.html',
        ngo: '/Common frontend HTML/ngo-dashboard.html'
    };
    return dashboardUrls[userType] || '/Common frontend HTML/donor-dashboard.html';
}

// Get user type label for display
function getUserTypeLabel(userType) {
    const labels = {
        donor: 'Donor',
        volunteer: 'Volunteer',
        ngo: 'NGO'
    };
    return labels[userType] || 'User';
}

// Handle signup tab parameter from URL
function handleSignupTabParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    
    if (tab && window.location.pathname.includes('signup.html')) {
        // Store tab preference for signup page
        sessionStorage.setItem('signupTab', tab);
    }
}

// Initialize page-specific features
function initializePageFeatures() {
    const pathname = window.location.pathname;
    
    if (pathname.includes('index.html') || pathname === '/') {
        initializeHomepage();
    } else if (pathname.includes('signup.html')) {
        initializeSignupPage();
    } else if (pathname.includes('login.html')) {
        initializeLoginPage();
    }
}

// Initialize homepage features
function initializeHomepage() {
    console.log('Initializing homepage features');
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add animation to feature cards
    animateOnScroll();
    
    // Update stats dynamically
    updateStats();
}

// Initialize signup page
function initializeSignupPage() {
    console.log('Initializing signup page');
    
    // Check for tab preference
    const preferredTab = sessionStorage.getItem('signupTab');
    if (preferredTab) {
        // This will be handled by signup.js
        console.log('Preferred signup tab:', preferredTab);
        sessionStorage.removeItem('signupTab');
    }
}

// Initialize login page
function initializeLoginPage() {
    console.log('Initializing login page');
    
    // Add any login-specific features here
    // Most functionality is in login.js
}

// Animate elements on scroll
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe feature cards and stat items
    document.querySelectorAll('.feature-card, .stat-item').forEach(el => {
        observer.observe(el);
    });
}

// Update statistics dynamically
function updateStats() {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Calculate real stats from registered users
    const donors = users.filter(u => u.userType === 'donor' || (!u.userType && !u.is_volunteer && !u.is_ngo));
    const volunteers = users.filter(u => u.userType === 'volunteer' || u.is_volunteer);
    const ngos = users.filter(u => u.userType === 'ngo' || u.is_ngo);
    
    // Calculate total impact
    let totalLivesImpacted = 0;
    let totalFundsRaised = 0;
    
    users.forEach(user => {
        if (user.donor_data && user.donor_data.statistics) {
            totalLivesImpacted += user.donor_data.statistics.lives_impacted || 0;
            totalFundsRaised += user.donor_data.statistics.money_donated || 0;
        }
    });
    
    // Update stat displays (if elements exist)
    const statItems = document.querySelectorAll('.stat-item h3');
    if (statItems.length >= 4) {
        statItems[0].textContent = `${Math.max(totalLivesImpacted, 5000).toLocaleString()}+`;
        statItems[1].textContent = `${Math.max(volunteers.length, 500)}+`;
        statItems[2].textContent = `${Math.max(ngos.length, 100)}+`;
        statItems[3].textContent = `₹${Math.max(totalFundsRaised, 1000000).toLocaleString()}+`;
    }
}

// Global logout function
function logout() {
    console.log('Logging out user');
    
    if (confirm('Are you sure you want to logout?')) {
        // Clear all session data
        localStorage.removeItem('currentUser');
        sessionStorage.clear();
        
        // Show success message
        showMessage('Logged out successfully!', 'success');
        
        // Redirect to homepage after delay
        setTimeout(() => {
            window.location.href = '/Common frontend HTML/index.html';
        }, 1500);
    }
}

// Show message utility function
function showMessage(message, type = 'info') {
    // Create message element if it doesn't exist
    let messageDiv = document.getElementById('global-message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'global-message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(messageDiv);
    }
    
    // Set message type styles
    const typeStyles = {
        success: 'background-color: #4caf50;',
        error: 'background-color: #f44336;',
        warning: 'background-color: #ff9800;',
        info: 'background-color: #2196f3;'
    };
    
    messageDiv.style.cssText += typeStyles[type] || typeStyles.info;
    messageDiv.textContent = message;
    
    // Show message
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide message after 4 seconds
    setTimeout(() => {
        messageDiv.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 4000);
}

// Utility functions
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function getCurrentUserType() {
    const user = getCurrentUser();
    if (!user) return null;
    return user.userType || (user.is_volunteer ? 'volunteer' : (user.is_ngo ? 'ngo' : 'donor'));
}

// Check authentication and redirect if needed
function requireAuth() {
    if (!isLoggedIn()) {
        console.log('Authentication required, redirecting to login');
        window.location.href = '/Common frontend HTML/login.html';
        return false;
    }
    return true;
}

// Redirect to appropriate dashboard
function redirectToDashboard() {
    const userType = getCurrentUserType();
    const dashboardUrl = getDashboardUrl(userType);
    window.location.href = dashboardUrl;
}

// Debug function
function debugCareConnect() {
    console.log('=== CARECONNECT DEBUG INFO ===');
    console.log('Current User:', getCurrentUser());
    console.log('User Type:', getCurrentUserType());
    console.log('Is Logged In:', isLoggedIn());
    console.log('Registered Users:', JSON.parse(localStorage.getItem('registeredUsers') || '[]'));
    console.log('Current Page:', window.location.pathname);
    console.log('===============================');
}

// Make functions globally available
window.logout = logout;
window.showMessage = showMessage;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.getCurrentUserType = getCurrentUserType;
window.requireAuth = requireAuth;
window.redirectToDashboard = redirectToDashboard;
window.debugCareConnect = debugCareConnect;

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible, refresh navigation
        updateNavigation();
    }
});

// Handle browser back/forward navigation
window.addEventListener('popstate', function() {
    updateNavigation();
    initializePageFeatures();
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('CareConnect Error:', e.error);
    
    // Show user-friendly error message for critical errors
    if (e.error && e.error.message && e.error.message.includes('localStorage')) {
        showMessage('Storage access error. Please check your browser settings.', 'error');
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideInUp 0.6s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .user-indicator {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        margin-left: 20px;
        padding-left: 20px;
        border-left: 1px solid #e1e5e9;
    }
    
    .user-name {
        font-weight: 600;
        color: #333;
        font-size: 0.9rem;
    }
    
    .user-type {
        font-size: 0.8rem;
        color: #666;
        background: #f0f8ff;
        padding: 2px 8px;
        border-radius: 12px;
        margin-top: 2px;
    }
    
    .logout-link {
        color: #ff4757 !important;
        font-weight: 500;
    }
    
    .logout-link:hover {
        background: #fff5f5 !important;
    }
`;
document.head.appendChild(style);