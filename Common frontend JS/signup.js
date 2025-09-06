// signup.js - Enhanced Signup functionality with tab switching and localStorage integration

document.addEventListener('DOMContentLoaded', function() {
    const messageDiv = document.getElementById('message');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Check if user is already logged in - if yes, redirect to dashboard
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
        console.log('User already logged in, redirecting to dashboard');
        window.location.href = '/Common frontend HTML/dashboard.html';
        return;
    }

    console.log('Signup page loaded successfully');

    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and forms
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding form
            document.getElementById(`${tabId}Form`).classList.add('active');
            
            // Clear any previous messages
            messageDiv.className = 'hidden';
            messageDiv.innerHTML = '';
            
            console.log('Switched to tab:', tabId);
        });
    });

    // Form submission handlers
    const donorForm = document.getElementById('donorForm');
    const volunteerForm = document.getElementById('volunteerForm');
    const ngoForm = document.getElementById('ngoForm');

    if (donorForm) {
        donorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup('donor');
        });
    }

    if (volunteerForm) {
        volunteerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup('volunteer');
        });
    }

    if (ngoForm) {
        ngoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup('ngo');
        });
    }

    function handleSignup(userType) {
        console.log(`${userType} signup submitted`);
        
        const formData = extractFormData(userType);
        console.log('Form data collected:', { ...formData, password: '***' });

        // Validate all inputs
        if (!validateSignup(formData, userType)) {
            return;
        }

        // Check if user already exists
        if (checkUserExists(formData.mobile, formData.email)) {
            return;
        }

        // Register user
        registerUser(formData, userType);
    }

    function extractFormData(userType) {
        const data = {
            name: document.getElementById(`${userType}Name`).value.trim(),
            email: document.getElementById(`${userType}Email`).value.trim().toLowerCase(),
            mobile: document.getElementById(`${userType}Mobile`).value.trim(),
            address: document.getElementById(`${userType}Address`).value.trim(),
            password: document.getElementById(`${userType}Password`).value,
            userType: userType
        };

        // Add type-specific fields
        if (userType === 'volunteer') {
            data.skills = document.getElementById('volunteerSkills').value.trim();
            data.availability = document.getElementById('volunteerAvailability').value;
        } else if (userType === 'ngo') {
            data.registration = document.getElementById('ngoRegistration').value.trim();
            data.focus = document.getElementById('ngoFocus').value.trim();
        }

        return data;
    }

    function validateSignup(data, userType) {
        console.log('Validating signup data for:', userType);
        
        // Clear previous messages and error states
        messageDiv.className = 'hidden';
        messageDiv.innerHTML = '';
        clearErrorMessages();
        resetInputStyles();

        let isValid = true;

        // Validate name
        if (!data.name) {
            showFieldError(`${userType}Name`, 'Name is required');
            isValid = false;
        } else if (data.name.length < 2) {
            showFieldError(`${userType}Name`, 'Name must be at least 2 characters long');
            isValid = false;
        } else if (!/^[a-zA-Z\s.''-]+$/.test(data.name)) {
            showFieldError(`${userType}Name`, 'Name can only contain letters, spaces, and common punctuation');
            isValid = false;
        } else if (data.name.length > 50) {
            showFieldError(`${userType}Name`, 'Name cannot exceed 50 characters');
            isValid = false;
        }

        // Validate email
        if (!data.email) {
            showFieldError(`${userType}Email`, 'Email address is required');
            isValid = false;
        } else {
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (!emailRegex.test(data.email)) {
                showFieldError(`${userType}Email`, 'Please enter a valid email address');
                isValid = false;
            } else if (data.email.length > 100) {
                showFieldError(`${userType}Email`, 'Email cannot exceed 100 characters');
                isValid = false;
            }
        }

        // Validate mobile number
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!data.mobile) {
            showFieldError(`${userType}Mobile`, 'Mobile number is required');
            isValid = false;
        } else if (!mobileRegex.test(data.mobile)) {
            showFieldError(`${userType}Mobile`, 'Please enter a valid 10-digit Indian mobile number starting with 6-9');
            isValid = false;
        }

        // Validate address
        if (!data.address) {
            showFieldError(`${userType}Address`, 'Address is required');
            isValid = false;
        } else if (data.address.length < 10) {
            showFieldError(`${userType}Address`, 'Please enter a complete address (minimum 10 characters)');
            isValid = false;
        } else if (data.address.length > 200) {
            showFieldError(`${userType}Address`, 'Address cannot exceed 200 characters');
            isValid = false;
        }

        // Validate password
        if (!data.password) {
            showFieldError(`${userType}Password`, 'Password is required');
            isValid = false;
        } else if (data.password.length < 6) {
            showFieldError(`${userType}Password`, 'Password must be at least 6 characters long');
            isValid = false;
        } else if (data.password.length > 50) {
            showFieldError(`${userType}Password`, 'Password cannot exceed 50 characters');
            isValid = false;
        } else if (!/[a-zA-Z]/.test(data.password)) {
            showFieldError(`${userType}Password`, 'Password must contain at least one letter');
            isValid = false;
        } else if (!/\d/.test(data.password)) {
            showFieldError(`${userType}Password`, 'Password must contain at least one number');
            isValid = false;
        } else {
            const commonPasswords = ['123456', 'password', '123456789', 'qwerty', 'abc123'];
            if (commonPasswords.includes(data.password.toLowerCase())) {
                showFieldError(`${userType}Password`, 'This password is too common. Please choose a stronger password');
                isValid = false;
            }
        }

        // NGO-specific validation
        if (userType === 'ngo') {
            if (!data.registration) {
                showFieldError('ngoRegistration', 'Registration number is required');
                isValid = false;
            } else if (data.registration.length < 5) {
                showFieldError('ngoRegistration', 'Registration number must be at least 5 characters long');
                isValid = false;
            }
        }

        // Volunteer skills validation (optional but if provided, should be meaningful)
        if (userType === 'volunteer' && data.skills && data.skills.length > 0 && data.skills.length < 10) {
            showFieldError('volunteerSkills', 'Please provide a more detailed description of your skills');
            isValid = false;
        }

        console.log('Signup validation result:', isValid);
        return isValid;
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
            focusField(getActiveForm() + 'Mobile');
            return true;
        }

        // Check if email already exists
        const emailExists = existingUsers.some(user => user.email === email);
        if (emailExists) {
            console.log('Email already exists:', email);
            showError('This email address is already registered. Please use a different email or login.');
            focusField(getActiveForm() + 'Email');
            return true;
        }

        console.log('User does not exist, can proceed with signup');
        return false;
    }

    function registerUser(data, userType) {
        console.log('Starting user registration process for:', userType);
        
        // Show loading state
        setLoadingState(true, userType);

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
                    userType: userType,
                    is_volunteer: userType === 'volunteer',
                    is_ngo: userType === 'ngo',
                    registration_date: new Date().toISOString(),
                    last_login: null
                };

                // Add type-specific fields
                if (userType === 'volunteer') {
                    newUser.skills = data.skills || '';
                    newUser.availability = data.availability || '';
                } else if (userType === 'ngo') {
                    newUser.registration_number = data.registration;
                    newUser.focus_areas = data.focus || '';
                }

                console.log('New user object created:', { ...newUser, password: '***' });

                // Add to users array
                existingUsers.push(newUser);
                
                // Save to localStorage
                localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
                console.log('User saved to localStorage. Total users:', existingUsers.length);
                
                // Show success message
                setLoadingState(false, userType);
                showSuccess(`Registration successful as ${userType}! Redirecting to login page...`);
                
                // Clear form
                document.getElementById(`${userType}Form`).reset();
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    console.log('Redirecting to login page...');
                    window.location.href = '/Common frontend HTML/login.html';
                }, 3000);
                
            } catch (error) {
                console.error('Registration error:', error);
                setLoadingState(false, userType);
                showError('Registration failed. Please try again.');
            }
        }, 1500); // Simulate network delay
    }

    function generateUserId() {
        const userId = 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        console.log('Generated user ID:', userId);
        return userId;
    }

    function getActiveForm() {
        const activeTab = document.querySelector('.tab-button.active');
        return activeTab ? activeTab.getAttribute('data-tab') : 'donor';
    }

    function showError(message) {
        console.log('Showing error:', message);
        messageDiv.className = 'message error';
        messageDiv.innerHTML = `<i class="error-icon">⚠️</i> ${message}`;
        messageDiv.classList.remove('hidden');
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide error after 7 seconds
        setTimeout(() => {
            if (messageDiv.classList.contains('error')) {
                messageDiv.className = 'hidden';
            }
        }, 7000);
    }

    function showSuccess(message) {
        console.log('Showing success:', message);
        messageDiv.className = 'message success';
        messageDiv.innerHTML = `<i class="success-icon">✅</i> ${message}`;
        messageDiv.classList.remove('hidden');
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (field && errorElement) {
            field.classList.add('invalid');
            field.style.borderColor = '#ff6b6b';
            field.style.backgroundColor = '#ffebee';
            errorElement.innerHTML = message;
            errorElement.style.display = 'block';
            errorElement.style.color = '#ff6b6b';
            
            // Focus the first invalid field
            if (!document.querySelector('.invalid:focus')) {
                field.focus();
            }
        }
    }

    function clearErrorMessages() {
        const errorElements = document.querySelectorAll('.error-text');
        errorElements.forEach(element => {
            element.innerHTML = '';
            element.style.display = 'none';
        });
    }

    function resetInputStyles() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('invalid', 'valid');
            input.style.borderColor = '';
            input.style.backgroundColor = '';
        });
    }

    function focusField(fieldName) {
        const field = document.getElementById(fieldName);
        if (field) {
            field.focus();
            field.style.borderColor = '#ff6b6b';
            
            // Reset border color after focus
            setTimeout(() => {
                if (!field.classList.contains('invalid')) {
                    field.style.borderColor = '#e1e5e9';
                }
            }, 3000);
        }
    }

    function setLoadingState(loading, userType) {
        const submitButton = document.querySelector(`#${userType}Form button[type="submit"]`);
        if (!submitButton) {
            console.error('Submit button not found for:', userType);
            return;
        }
        
        if (loading) {
            submitButton.disabled = true;
            submitButton.classList.add('btn-loading');
            submitButton.innerHTML = '⏳ Registering...';
            console.log('Loading state: ON for', userType);
        } else {
            submitButton.disabled = false;
            submitButton.classList.remove('btn-loading');
            submitButton.textContent = `Sign Up as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`;
            console.log('Loading state: OFF for', userType);
        }
    }

    // Mobile number input formatting for all forms
    const mobileInputs = document.querySelectorAll('input[type="tel"]');
    mobileInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Remove any non-digit characters
            let value = e.target.value.replace(/\D/g, '');
            
            // Limit to 10 digits
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            
            e.target.value = value;
        });

        // Prevent non-numeric input
        input.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.which);
            if (!/[0-9]/.test(char)) {
                e.preventDefault();
            }
        });
    });

    // Real-time validation feedback for all inputs
    const allInputs = document.querySelectorAll('input, textarea, select');
    allInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateSingleField(this);
        });
        
        input.addEventListener('input', function() {
            // Remove error styling on input
            if (this.classList.contains('invalid')) {
                this.classList.remove('invalid');
                this.style.borderColor = '#e1e5e9';
                this.style.backgroundColor = '#fafbfc';
                
                const errorElement = document.getElementById(this.id + 'Error');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            }
        });

        input.addEventListener('focus', function() {
            this.style.borderColor = '#667eea';
            this.style.backgroundColor = 'white';
        });
    });

    function validateSingleField(input) {
        const value = input.value.trim();
        let isValid = true;
        
        // Name validation
        if (input.name === 'name' && value) {
            if (value.length < 2 || !/^[a-zA-Z\s.''-]+$/.test(value)) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffebee';
                isValid = false;
            }
        }

        // Email validation
        if (input.name === 'email' && value) {
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            if (!emailRegex.test(value)) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffebee';
                isValid = false;
            }
        }

        // Mobile validation
        if (input.name === 'mobile' && value) {
            const mobileRegex = /^[6-9]\d{9}$/;
            if (!mobileRegex.test(value)) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffebee';
                isValid = false;
            }
        }
        
        // Password validation
        if (input.name === 'password' && value) {
            if (value.length < 6 || !/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffebee';
                isValid = false;
            }
        }
        
        // Address validation
        if (input.name === 'address' && value) {
            if (value.length < 10) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffebee';
                isValid = false;
            }
        }

        // Registration number validation for NGO
        if (input.name === 'registration' && value) {
            if (value.length < 5) {
                input.style.borderColor = '#ff6b6b';
                input.style.backgroundColor = '#ffebee';
                isValid = false;
            }
        }
        
        // Apply valid styling
        if (value && isValid) {
            input.style.borderColor = '#4ecdc4';
            input.style.backgroundColor = '#f0ffff';
        }
        
        return isValid;
    }

    // Password strength indicator for all password fields
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(passwordInput => {
        passwordInput.addEventListener('input', function() {
            showPasswordStrength(this);
        });
    });

    function showPasswordStrength(passwordField) {
        const password = passwordField.value;
        
        // Remove existing indicator
        const existingIndicator = passwordField.parentNode.querySelector('.password-strength');
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
        passwordField.parentNode.appendChild(strengthIndicator);
    }

    // Auto-focus first input field of active form
    function focusActiveForm() {
        const activeForm = document.querySelector('.tab-content.active');
        if (activeForm) {
            const firstInput = activeForm.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    // Initial focus
    focusActiveForm();

    // Focus when tab changes
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            setTimeout(() => {
                focusActiveForm();
            }, 100);
        });
    });

    // Debugging: Check localStorage data
    console.log('Registered users in localStorage:', JSON.parse(localStorage.getItem('registeredUsers') || '[]'));
    console.log('Current user in localStorage:', JSON.parse(localStorage.getItem('currentUser') || 'null'));
});

// Utility functions (consistent with login.js)
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