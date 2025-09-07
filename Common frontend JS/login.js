// login.js - Complete Enhanced Login functionality with improved user type handling

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    // Check if required elements exist
    if (!loginForm) {
        console.error('Login form not found. Make sure the form has id="loginForm"');
        return;
    }

    if (!messageDiv) {
        console.error('Message div not found. Make sure there is a div with id="message"');
        return;
    }

    // Check if user is already logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
        console.log('User already logged in, redirecting to dashboard');
        redirectToCorrectDashboard(currentUser.userType);
        return;
    }

    console.log('Login page loaded successfully');

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Login form submitted');
        
        const mobileInput = document.getElementById('mobile');
        const passwordInput = document.getElementById('password');

        if (!mobileInput || !passwordInput) {
            console.error('Mobile or password input not found');
            showError('Form elements not found. Please refresh the page.');
            return;
        }

        const mobile = mobileInput.value.trim();
        const password = passwordInput.value;

        console.log('Attempting login for mobile:', mobile);

        // Validate inputs
        if (!validateLogin(mobile, password)) {
            return;
        }

        // Attempt login
        loginUser(mobile, password);
    });

    function validateLogin(mobile, password) {
        console.log('Validating login inputs');
        
        // Clear previous messages
        messageDiv.className = 'hidden';
        messageDiv.innerHTML = '';

        // Validate mobile number
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobile) {
            showError('Mobile number is required');
            focusField('mobile');
            return false;
        }
        if (!mobileRegex.test(mobile)) {
            showError('Please enter a valid 10-digit mobile number starting with 6-9');
            focusField('mobile');
            return false;
        }

        // Validate password
        if (!password) {
            showError('Password is required');
            focusField('password');
            return false;
        }
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            focusField('password');
            return false;
        }

        console.log('Login validation passed');
        return true;
    }

    function loginUser(mobile, password) {
        console.log('Starting login process for mobile:', mobile);
        
        // Show loading state
        setLoadingState(true);

        // Small delay to show loading state
        setTimeout(() => {
            try {
                // Get registered users from localStorage
                const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                console.log('Total registered users:', users.length);
                
                // Find user by mobile
                const user = users.find(u => u.mobile === mobile);
                
                if (!user) {
                    console.log('User not found for mobile:', mobile);
                    setLoadingState(false);
                    showError('Mobile number not registered. Please register first.');
                    focusField('mobile');
                    return;
                }

                console.log('User found:', user.name);

                // Check password (in real app, this would be hashed and compared securely)
                if (user.password !== password) {
                    console.log('Invalid password for user:', user.name);
                    setLoadingState(false);
                    showError('Invalid password. Please try again.');
                    focusField('password');
                    return;
                }

                // Login successful
                console.log('Login successful for user:', user.name);
                setLoadingState(false);
                
                // Determine user type for display and routing
                let userType = determineUserType(user);
                let userTypeDisplay = getUserTypeDisplay(userType);
                
                showSuccess(`Welcome back, ${userTypeDisplay}! Redirecting to dashboard...`);
                
                // Update last login time
                user.last_login = new Date().toISOString();
                
                // Update user in storage
                const userIndex = users.findIndex(u => u.mobile === mobile);
                users[userIndex] = user;
                localStorage.setItem('registeredUsers', JSON.stringify(users));
                
                // Store current user session with enhanced data
                const userSession = createUserSession(user, userType);
                localStorage.setItem('currentUser', JSON.stringify(userSession));
                
                console.log('User session created:', { ...userSession, password: undefined });
                
                // Clear form
                loginForm.reset();
                
                // Redirect to appropriate dashboard after 1.5 seconds
                setTimeout(() => {
                    console.log('Redirecting to dashboard...');
                    redirectToCorrectDashboard(userType);
                }, 1500);
                
            } catch (error) {
                console.error('Login error:', error);
                setLoadingState(false);
                showError('Login failed. Please try again.');
            }
        }, 500); // Small delay to show loading state
    }

    // Determine user type based on user data
    function determineUserType(user) {
        // Priority 1: Check explicit userType field
        if (user.userType) {
            return user.userType;
        }
        // Priority 2: Check flags
        else if (user.is_ngo === true) {
            return 'ngo';
        }
        else if (user.is_volunteer === true) {
            return 'volunteer';
        }
        // Priority 3: Default to donor
        else {
            return 'donor';
        }
    }

    // Get user type display label
    function getUserTypeDisplay(userType) {
        const labels = {
            donor: 'Donor',
            volunteer: 'Volunteer',
            ngo: 'NGO'
        };
        return labels[userType] || 'User';
    }

    // Create user session object
    function createUserSession(user, userType) {
        const session = {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            address: user.address,
            userType: userType,
            is_volunteer: user.is_volunteer || false,
            is_ngo: user.is_ngo || false,
            loginTime: new Date().toISOString()
        };

        // Add type-specific data to session
        if (user.skills) session.skills = user.skills;
        if (user.availability) session.availability = user.availability;
        if (user.registration_number) session.registration_number = user.registration_number;
        if (user.focus_areas) session.focus_areas = user.focus_areas;
        if (user.organization_name) session.organization_name = user.organization_name;
        
        return session;
    }

    // Redirect to correct dashboard based on user type
    function redirectToCorrectDashboard(userType) {
        const dashboardUrls = {
            donor: '/Common frontend HTML/donor-dashboard.html',
            volunteer: '/Common frontend HTML/volunteer-dashboard.html',
            ngo: '/Common frontend HTML/ngo-dashboard.html'
        };
        
        const redirectUrl = dashboardUrls[userType] || dashboardUrls.donor;
        window.location.href = redirectUrl;
    }

    function showError(message) {
        console.log('Showing error:', message);
        messageDiv.className = 'message error';
        messageDiv.innerHTML = `<i class="error-icon">⚠️</i> ${message}`;
        messageDiv.classList.remove('hidden');
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            if (messageDiv.classList.contains('error')) {
                messageDiv.className = 'hidden';
            }
        }, 5000);
    }

    function showSuccess(message) {
        console.log('Showing success:', message);
        messageDiv.className = 'message success';
        messageDiv.innerHTML = `<i class="success-icon">✅</i> ${message}`;
        messageDiv.classList.remove('hidden');
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function focusField(fieldName) {
        const field = document.getElementById(fieldName);
        if (field) {
            field.focus();
            field.style.borderColor = '#ff6b6b';
            
            // Reset border color after focus
            setTimeout(() => {
                field.style.borderColor = '#e1e5e9';
            }, 3000);
        }
    }

    function setLoadingState(loading) {
        const submitButton = loginForm.querySelector('button[type="submit"]');
        if (!submitButton) {
            console.error('Submit button not found');
            return;
        }
        if (loading) {
            submitButton.disabled = true;
            submitButton.classList.add('btn-loading');
            submitButton.textContent = 'Logging in...';
            console.log('Loading state: ON');
        } else {
            submitButton.disabled = false;
            submitButton.classList.remove('btn-loading');
            submitButton.textContent = 'Login';
            console.log('Loading state: OFF');
        }
    }

    // Mobile number input formatting and validation
    const mobileInput = document.getElementById('mobile');
    if (mobileInput) {
        mobileInput.addEventListener('input', function(e) {
            // Remove any non-digit characters
            let value = e.target.value.replace(/\D/g, '');
            
            // Limit to 10 digits
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            
            e.target.value = value;
        });

        // Prevent non-numeric input
        mobileInput.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.which);
            if (!/[0-9]/.test(char)) {
                e.preventDefault();
            }
        });
    }

    // Password field enhancements
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    // Add visual feedback for form validation
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInputField(this);
        });

        input.addEventListener('input', function() {
            // Remove error styling on input
            this.style.borderColor = '#e1e5e9';
            this.style.backgroundColor = '#fafbfc';
        });

        input.addEventListener('focus', function() {
            this.style.borderColor = '#667eea';
            this.style.backgroundColor = 'white';
        });
    });

    function validateInputField(input) {
        const value = input.value.trim();
        let isValid = true;
        
        if (input.name === 'mobile' || input.id === 'mobile') {
            const mobileRegex = /^[6-9]\d{9}$/;
            if (value && !mobileRegex.test(value)) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffebee';
                isValid = false;
            }
        }

        if (input.name === 'password' || input.id === 'password') {
            if (value && value.length < 6) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffebee';
                isValid = false;
            }
        }
      
        if (value && isValid) {
            input.style.borderColor = '#4ecdc4';
            input.style.backgroundColor = '#f0ffff';
        }
        
        return isValid;
    }

    // Auto-focus first input field
    const firstInput = loginForm.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }

    // Debugging: Check localStorage data
    console.log('Registered users in localStorage:', JSON.parse(localStorage.getItem('registeredUsers') || '[]'));
    console.log('Current user in localStorage:', JSON.parse(localStorage.getItem('currentUser') || 'null'));

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            // Allow normal tab navigation
            return;
        }
        
        if (e.key === 'Escape') {
            // Clear form on escape
            if (confirm('Clear login form?')) {
                loginForm.reset();
                if (messageDiv) {
                    messageDiv.className = 'hidden';
                }
                if (firstInput) {
                    firstInput.focus();
                }
            }
        }
    });

    // Handle paste events for mobile number
    if (mobileInput) {
        mobileInput.addEventListener('paste', function(e) {
            setTimeout(() => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 10) {
                    value = value.slice(0, 10);
                }
                e.target.value = value;
                validateInputField(e.target);
            }, 0);
        });
    }

    // Add form validation styling
    const style = document.createElement('style');
    style.textContent = `
        .btn-loading {
            position: relative;
            color: transparent !important;
        }
        
        .btn-loading::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            top: 50%;
            left: 50%;
            margin-left: -8px;
            margin-top: -8px;
            border-radius: 50%;
            border: 2px solid #ffffff;
            border-color: #ffffff transparent #ffffff transparent;
            animation: btn-loading 1.2s linear infinite;
        }
        
        @keyframes btn-loading {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        
        .message {
            padding: 12px 16px;
            border-radius: 6px;
            margin: 16px 0;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .message.error {
            background-color: #fee;
            color: #c53030;
            border: 1px solid #feb2b2;
        }
        
        .message.success {
            background-color: #f0fff4;
            color: #2f855a;
            border: 1px solid #9ae6b4;
        }
        
        .message.hidden {
            display: none;
        }
        
        input:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        input.invalid {
            animation: shake 0.3s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
});

// Enhanced utility functions
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

function logoutUser() {
    console.log('Logging out user...');
    localStorage.removeItem('currentUser');
    
    // Clear any session storage as well
    sessionStorage.clear();
    
    console.log('User logged out, redirecting to login...');
    window.location.href = '/Common frontend HTML/login.html';
}

function checkAuthentication() {
    if (!isLoggedIn()) {
        console.log('User not authenticated, redirecting to login...');
        window.location.href = '/Common frontend HTML/login.html';
        return false;
    }
    
    // Check if session is expired (24 hours)
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.loginTime) {
        const loginTime = new Date(currentUser.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursSinceLogin > 24) {
            console.log('Session expired, logging out');
            logoutUser();
            return false;
        }
    }
    
    return true;
}

// Global logout function that can be called from anywhere
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        logoutUser();
    }
}

// Function to redirect to appropriate dashboard
function redirectToDashboard() {
    const userType = getCurrentUserType();
    const dashboardUrls = {
        donor: '/Common frontend HTML/donor-dashboard.html',
        volunteer: '/Common frontend HTML/volunteer-dashboard.html',
        ngo: '/Common frontend HTML/ngo-dashboard.html'
    };
    
    const redirectUrl = dashboardUrls[userType] || dashboardUrls.donor;
    window.location.href = redirectUrl;
}

// Function to get user display info
function getUserDisplayInfo() {
    const user = getCurrentUser();
    if (!user) return null;
    
    return {
        name: user.name,
        email: user.email,
        userType: user.userType,
        displayType: getUserTypeDisplay(user.userType)
    };
}

function getUserTypeDisplay(userType) {
    const labels = {
        donor: 'Donor',
        volunteer: 'Volunteer',
        ngo: 'NGO'
    };
    return labels[userType] || 'User';
}

// Debug function to check localStorage
function debugStorage() {
    console.log('=== DEBUGGING LOGIN STORAGE ===');
    console.log('Registered Users:', localStorage.getItem('registeredUsers'));
    console.log('Current User:', localStorage.getItem('currentUser'));
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('Session Storage:', Object.keys(sessionStorage));
    
    const currentUser = getCurrentUser();
    if (currentUser) {
        console.log('Current User Type:', getCurrentUserType());
        console.log('User Display Info:', getUserDisplayInfo());
    }
    console.log('================================');
}

// Function to clear all app data (for development/testing)
function clearAllData() {
    if (confirm('This will clear all app data including registered users. Are you sure?')) {
        localStorage.clear();
        sessionStorage.clear();
        console.log('All app data cleared');
        window.location.reload();
    }
}

// Make functions globally available
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.getCurrentUserType = getCurrentUserType;
window.logout = logout;
window.debugStorage = debugStorage;
window.clearAllData = clearAllData;
window.redirectToDashboard = redirectToDashboard;
window.getUserDisplayInfo = getUserDisplayInfo;
window.checkAuthentication = checkAuthentication;