// registration.js - Registration functionality with localStorage integration

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    // Check if user is already logged in - if yes, redirect to dashboard
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
        console.log('User already logged in, redirecting to dashboard');
        window.location.href = '/Common frontend HTML/dashboard.html';
        return;
    }

    console.log('Registration page loaded successfully');

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Registration form submitted');
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            mobile: document.getElementById('mobile').value.trim(),
            address: document.getElementById('address').value.trim(),
            password: document.getElementById('password').value
        };

        console.log('Form data collected:', { ...formData, password: '***' });

        // Validate all inputs
        if (!validateRegistration(formData)) {
            return;
        }

        // Check if user already exists
        if (checkUserExists(formData.mobile, formData.email)) {
            return;
        }

        // Register user
        registerUser(formData);
    });

    function validateRegistration(data) {
        console.log('Validating registration data');
        
        // Clear previous messages
        messageDiv.className = 'hidden';
        messageDiv.innerHTML = '';

        // Validate name
        if (!data.name) {
            showError('Full name is required');
            focusField('name');
            return false;
        }
        if (data.name.length < 2) {
            showError('Name must be at least 2 characters long');
            focusField('name');
            return false;
        }
        if (!/^[a-zA-Z\s.''-]+$/.test(data.name)) {
            showError('Name can only contain letters, spaces, and common punctuation');
            focusField('name');
            return false;
        }
        if (data.name.length > 50) {
            showError('Name cannot exceed 50 characters');
            focusField('name');
            return false;
        }

        // Validate email
        if (!data.email) {
            showError('Email address is required');
            focusField('email');
            return false;
        }
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(data.email)) {
            showError('Please enter a valid email address');
            focusField('email');
            return false;
        }
        if (data.email.length > 100) {
            showError('Email cannot exceed 100 characters');
            focusField('email');
            return false;
        }

        // Validate mobile number
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(data.mobile)) {
            showError('Please enter a valid 10-digit Indian mobile number starting with 6-9');
            focusField('mobile');
            return false;
        }

        // Validate address
        if (!data.address) {
            showError('Address is required');
            focusField('address');
            return false;
        }
        if (data.address.length < 10) {
            showError('Please enter a complete address (minimum 10 characters)');
            focusField('address');
            return false;
        }
        if (data.address.length > 200) {
            showError('Address cannot exceed 200 characters');
            focusField('address');
            return false;
        }

        // Validate password
        if (!data.password) {
            showError('Password is required');
            focusField('password');
            return false;
        }
        if (data.password.length < 6) {
            showError('Password must be at least 6 characters long');
            focusField('password');
            return false;
        }
        if (data.password.length > 50) {
            showError('Password cannot exceed 50 characters');
            focusField('password');
            return false;
        }
        // Check for at least one letter
        if (!/[a-zA-Z]/.test(data.password)) {
            showError('Password must contain at least one letter');
            focusField('password');
            return false;
        }
        // Check for at least one number
        if (!/\d/.test(data.password)) {
            showError('Password must contain at least one number');
            focusField('password');
            return false;
        }
        // Check for common weak passwords
        const commonPasswords = ['123456', 'password', '123456789', 'qwerty', 'abc123'];
        if (commonPasswords.includes(data.password.toLowerCase())) {
            showError('This password is too common. Please choose a stronger password');
            focusField('password');
            return false;
        }

        console.log('Registration validation passed');
        return true;
    }

    function checkUserExists(mobile, email) {
        console.log('Checking if user exists:', mobile, email);
        
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        console.log('Existing users count:', existingUsers.length);
        
        // Check if mobile already exists
        const mobileExists = existingUsers.some(user => user.mobile === mobile);
        if (mobileExists) {
            console.log('Mobile number already exists:', mobile);
            showError('This mobile number is already registered. Please use a different number or login.');
            focusField('mobile');
            return true;
        }

        // Check if email already exists
        const emailExists = existingUsers.some(user => user.email === email);
        if (emailExists) {
            console.log('Email already exists:', email);
            showError('This email address is already registered. Please use a different email or login.');
            focusField('email');
            return true;
        }

        console.log('User does not exist, can proceed with registration');
        return false;
    }

    function registerUser(data) {
        console.log('Starting user registration process');
        
        // Show loading state
        setLoadingState(true);

        // Simulate API call delay
        setTimeout(() => {
            try {
                // Get existing users
                const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                
                // Create new user object
                const newUser = {
                    user_id: generateUserId(),
                    name: data.name,
                    email: data.email,
                    mobile: data.mobile,
                    address: data.address,
                    password: data.password, // In real app, this would be hashed
                    is_volunteer: false,
                    registration_date: new Date().toISOString(),
                    last_login: null
                };

                console.log('New user object created:', { ...newUser, password: '***' });

                // Add to users array
                existingUsers.push(newUser);
                
                // Save to localStorage
                localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
                console.log('User saved to localStorage. Total users:', existingUsers.length);
                
                // Show success message
                setLoadingState(false);
                showSuccess('Registration successful! Redirecting to login page...');
                
                // Clear form
                registerForm.reset();
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    console.log('Redirecting to login page...');
                    window.location.href = '/Common frontend HTML/login.html';
                }, 3000);
                
            } catch (error) {
                console.error('Registration error:', error);
                setLoadingState(false);
                showError('Registration failed. Please try again.');
            }
        }, 1500); // Simulate network delay
    }

    function generateUserId() {
        // Generate a simple user ID
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        console.log('Generated user ID:', userId);
        return userId;
    }

    function showError(message) {
        console.log('Showing error:', message);
        messageDiv.className = 'message error';
        messageDiv.innerHTML = message;
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
        messageDiv.innerHTML = message;
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
        const submitButton = registerForm.querySelector('button[type="submit"]');
        if (!submitButton) {
            console.error('Submit button not found');
            return;
        }
        
        if (loading) {
            submitButton.disabled = true;
            submitButton.classList.add('btn-loading');
            submitButton.textContent = 'Registering...';
            console.log('Loading state: ON');
        } else {
            submitButton.disabled = false;
            submitButton.classList.remove('btn-loading');
            submitButton.textContent = 'Register';
            console.log('Loading state: OFF');
        }
    }

    // Mobile number input formatting
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

    // Real-time validation feedback
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateSingleField(this);
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

    function validateSingleField(input) {
        const value = input.value.trim();
        let isValid = true;
        
        if (input.name === 'name' && value) {
            if (value.length < 2 || !/^[a-zA-Z\s.''-]+$/.test(value)) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffebee';
                isValid = false;
            }
        }

        if (input.name === 'email' && value) {
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (!emailRegex.test(value)) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffebee';
                isValid = false;
            }
        }

        if (input.name === 'mobile' && value) {
            const mobileRegex = /^[6-9]\d{9}$/;
            if (!mobileRegex.test(value)) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffebee';
                isValid = false;
            }
        }
        
        if (input.name === 'password' && value) {
            if (value.length < 6 || !/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffebee';
                isValid = false;
            }
        }
        
        if (input.name === 'address' && value) {
            if (value.length < 10) {
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

    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            showPasswordStrength(this.value);
        });
    }

    function showPasswordStrength(password) {
        // Remove existing indicator
        const existingIndicator = passwordInput.parentNode.querySelector('.password-strength');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        if (password.length === 0) return;

        let strength = 0;
        let strengthText = '';
        let strengthColor = '';

        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength < 3) {
            strengthText = 'Weak';
            strengthColor = '#f44336';
        } else if (strength < 5) {
            strengthText = 'Medium';
            strengthColor = '#ff9800';
        } else {
            strengthText = 'Strong';
            strengthColor = '#4caf50';
        }

        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        strengthIndicator.style.cssText = `
            margin-top: 5px;
            font-size: 0.8rem;
            color: ${strengthColor};
            font-weight: 500;
        `;
        strengthIndicator.textContent = `Password strength: ${strengthText}`;
        passwordInput.parentNode.appendChild(strengthIndicator);
    }

    // Auto-focus first input field
    const firstInput = registerForm.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }

    // Debugging: Check localStorage data
    console.log('Registered users in localStorage:', JSON.parse(localStorage.getItem('registeredUsers') || '[]'));
    console.log('Current user in localStorage:', JSON.parse(localStorage.getItem('currentUser') || 'null'));
});

// Utility functions
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function logoutUser() {
    console.log('Logging out user...');
    localStorage.removeItem('currentUser');
    console.log('User logged out, redirecting to login...');
    window.location.href = '/Common frontend HTML/login.html';
}

function checkAuthentication() {
    if (!isLoggedIn()) {
        console.log('User not authenticated, redirecting to login...');
        window.location.href = '/Common frontend HTML/login.html';
        return false;
    }
    return true;
}

// Global logout function that can be called from anywhere
function logout() {
    logoutUser();
}

// Debug function to check localStorage
function debugStorage() {
    console.log('=== DEBUGGING STORAGE ===');
    console.log('Registered Users:', localStorage.getItem('registeredUsers'));
    console.log('Current User:', localStorage.getItem('currentUser'));
    console.log('All localStorage keys:', Object.keys(localStorage));
}