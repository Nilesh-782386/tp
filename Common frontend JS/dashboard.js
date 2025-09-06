// dashboard.js - Dashboard functionality with localStorage integration

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page loading...');
    
    // Check authentication first
    if (!checkAuthentication()) {
        return;
    }

    // Initialize dashboard
    initializeDashboard();
    setupEventListeners();
});

function checkAuthentication() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        console.log('No user session found, redirecting to login...');
        window.location.href = '/Common frontend HTML/login.html';
        return false;
    }
    console.log('User authenticated:', currentUser.name);
    return true;
}
function initializeDashboard() {
    console.log('Initializing dashboard...');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) return;

    // Update user information
    updateUserProfile(currentUser);
    
    // Check volunteer status and show appropriate sections
    updateVolunteerStatus(currentUser);
    
    // Load user's additional data if exists
    loadUserAdditionalData(currentUser);
    
    console.log('Dashboard initialized successfully');
}

function updateUserProfile(user) {
    console.log('Updating user profile display');
    
    // Update profile header
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    
    if (userName) userName.textContent = user.name;
    if (userRole) {
        userRole.textContent = user.is_volunteer ? 'Volunteer' : 'Donor';
        userRole.className = `role-badge ${user.is_volunteer ? 'volunteer' : 'donor'}`;
    }
    if (avatarPlaceholder) {
        avatarPlaceholder.textContent = user.name.charAt(0).toUpperCase();
    }
    
    // Update profile information cards
    const userEmail = document.getElementById('user-email');
    const userMobile = document.getElementById('user-mobile');
    const userAddress = document.getElementById('user-address');
    const memberSince = document.getElementById('member-since');
    
    if (userEmail) userEmail.textContent = user.email;
    if (userMobile) userMobile.textContent = user.mobile;
    if (userAddress) userAddress.textContent = user.address;
    if (memberSince) {
        // Get registration date from registered users
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const fullUser = users.find(u => u.user_id === user.user_id);
        if (fullUser && fullUser.registration_date) {
            const regDate = new Date(fullUser.registration_date);
            memberSince.textContent = regDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            memberSince.textContent = 'Recently joined';
        }
    }
    
    // Update edit form with current values
    const editName = document.getElementById('edit-name');
    const editEmail = document.getElementById('edit-email');
    const editMobile = document.getElementById('edit-mobile');
    const editAddress = document.getElementById('edit-address');
    
    if (editName) editName.value = user.name;
    if (editEmail) editEmail.value = user.email;
    if (editMobile) editMobile.value = user.mobile;
    if (editAddress) editAddress.value = user.address;
}

function updateVolunteerStatus(user) {
    const volunteerRegisterSection = document.getElementById('volunteer-register-section');
    const volunteerSection = document.getElementById('volunteer-section');
    
    if (user.is_volunteer) {
        // User is a volunteer, show volunteer dashboard
        if (volunteerRegisterSection) volunteerRegisterSection.classList.add('hidden');
        if (volunteerSection) volunteerSection.classList.remove('hidden');
        
        // Load volunteer data
        loadVolunteerData(user);
    } else {
        // User is not a volunteer, show registration option
        if (volunteerRegisterSection) volunteerRegisterSection.classList.remove('hidden');
        if (volunteerSection) volunteerSection.classList.add('hidden');
    }
}

function loadVolunteerData(user) {
    console.log('Loading volunteer data for:', user.name);
    
    // Get full user data from registered users
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const fullUser = users.find(u => u.user_id === user.user_id);
    
    if (fullUser && fullUser.volunteer_data) {
        const volData = fullUser.volunteer_data;
        
        const volSkills = document.getElementById('vol-skills');
        const volAvailability = document.getElementById('vol-availability');
        const volLocation = document.getElementById('vol-location');
        const volStatus = document.getElementById('vol-status');
        
        if (volSkills) volSkills.textContent = volData.skills || 'Not specified';
        if (volAvailability) volAvailability.textContent = volData.availability || 'Not specified';
        if (volLocation) volLocation.textContent = volData.preferred_location || 'Not specified';
        if (volStatus) volStatus.textContent = volData.status || 'Active';
    }
}

function loadUserAdditionalData(user) {
    // Load any additional user data or preferences
    console.log('Loading additional user data...');
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Volunteer form submission
    const volunteerForm = document.getElementById('volunteerForm');
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', handleVolunteerRegistration);
    }
    
    console.log('Event listeners set up successfully');
}

function handleProfileUpdate(e) {
    e.preventDefault();
    console.log('Profile update form submitted');
    
    const formData = new FormData(e.target);
    const updatedData = {
        name: formData.get('name').trim(),
        email: formData.get('email').trim().toLowerCase(),
        address: formData.get('address').trim()
    };
    
    // Validate the updated data
    if (!validateProfileUpdate(updatedData)) {
        return;
    }
    
    // Update user profile
    updateUserProfile_localStorage(updatedData);
}

function validateProfileUpdate(data) {
    const messageDiv = document.getElementById('message');
    
    // Clear previous messages
    if (messageDiv) {
        messageDiv.className = 'message hidden';
        messageDiv.innerHTML = '';
    }
    
    // Validate name
    if (!data.name || data.name.length < 2) {
        showMessage('Name must be at least 2 characters long', 'error');
        return false;
    }
    
    // Validate email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(data.email)) {
        showMessage('Please enter a valid email address', 'error');
        return false;
    }
    
    // Validate address
    if (!data.address || data.address.length < 10) {
        showMessage('Please enter a complete address (minimum 10 characters)', 'error');
        return false;
    }
    
    return true;
}

function updateUserProfile_localStorage(updatedData) {
    console.log('Updating user profile in localStorage');
    
    try {
        // Get current user session
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!currentUser) return;
        
        // Get all registered users
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = users.findIndex(u => u.user_id === currentUser.user_id);
        
        if (userIndex === -1) {
            showMessage('User not found', 'error');
            return;
        }
        
        // Update user data
        users[userIndex].name = updatedData.name;
        users[userIndex].email = updatedData.email;
        users[userIndex].address = updatedData.address;
        
        // Update current session
        currentUser.name = updatedData.name;
        currentUser.email = updatedData.email;
        currentUser.address = updatedData.address;
        
        // Save to localStorage
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI
        updateUserProfile(currentUser);
        
        showMessage('Profile updated successfully!', 'success');
        console.log('Profile updated successfully');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Failed to update profile. Please try again.', 'error');
    }
}

function handleVolunteerRegistration(e) {
    e.preventDefault();
    console.log('Volunteer registration form submitted');
    
    const formData = new FormData(e.target);
    const volunteerData = {
        skills: formData.get('skills').trim(),
        availability: formData.get('availability'),
        preferred_location: formData.get('preferred_location').trim(),
        experience: formData.get('experience').trim(),
        emergency_contact: formData.get('emergency_contact').trim(),
        emergency_mobile: formData.get('emergency_mobile').trim()
    };
    
    // Validate volunteer data
    if (!validateVolunteerData(volunteerData)) {
        return;
    }
    
    // Register as volunteer
    registerAsVolunteer(volunteerData);
}

function validateVolunteerData(data) {
    const messageDiv = document.getElementById('message');
    
    // Clear previous messages
    if (messageDiv) {
        messageDiv.className = 'message hidden';
        messageDiv.innerHTML = '';
    }
    
    // Validate required fields
    if (!data.skills) {
        showMessage('Skills & expertise is required', 'error');
        return false;
    }
    
    if (!data.availability) {
        showMessage('Availability is required', 'error');
        return false;
    }
    
    if (!data.preferred_location) {
        showMessage('Preferred location is required', 'error');
        return false;
    }
    
    // Validate emergency mobile if provided
    if (data.emergency_mobile) {
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(data.emergency_mobile)) {
            showMessage('Emergency mobile must be a valid 10-digit Indian mobile number', 'error');
            return false;
        }
    }
    
    return true;
}

function registerAsVolunteer(volunteerData) {
    console.log('Registering user as volunteer');
    
    try {
        // Get current user session
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!currentUser) return;
        
        // Get all registered users
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = users.findIndex(u => u.user_id === currentUser.user_id);
        
        if (userIndex === -1) {
            showMessage('User not found', 'error');
            return;
        }
        
        // Update user with volunteer data
        users[userIndex].is_volunteer = true;
        users[userIndex].volunteer_data = {
            ...volunteerData,
            registration_date: new Date().toISOString(),
            status: 'Active'
        };
        
        // Update current session
        currentUser.is_volunteer = true;
        
        // Save to localStorage
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI
        updateVolunteerStatus(currentUser);
        hideVolunteerForm();
        
        showMessage('Volunteer registration successful! Welcome to the CareConnect volunteer team!', 'success');
        console.log('Volunteer registration successful');
        
    } catch (error) {
        console.error('Error registering volunteer:', error);
        showMessage('Failed to register as volunteer. Please try again.', 'error');
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = message;
        messageDiv.classList.remove('hidden');
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageDiv.className = 'message hidden';
        }, 5000);
    }
    console.log(`${type.toUpperCase()}: ${message}`);
}

// Volunteer form show/hide functions
function showVolunteerForm() {
    console.log('Showing volunteer form');
    const formSection = document.getElementById('volunteer-form-section');
    const registerSection = document.getElementById('volunteer-register-section');
    
    if (formSection) formSection.classList.remove('hidden');
    if (registerSection) registerSection.classList.add('hidden');
}

function hideVolunteerForm() {
    console.log('Hiding volunteer form');
    const formSection = document.getElementById('volunteer-form-section');
    const registerSection = document.getElementById('volunteer-register-section');
    
    if (formSection) formSection.classList.add('hidden');
    if (registerSection) registerSection.classList.remove('hidden');
    
    // Clear form
    const volunteerForm = document.getElementById('volunteerForm');
    if (volunteerForm) volunteerForm.reset();
}

// Profile edit functions
function cancelEdit() {
    console.log('Cancelling profile edit');
    
    // Reset form to original values
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
        const editName = document.getElementById('edit-name');
        const editEmail = document.getElementById('edit-email');
        const editAddress = document.getElementById('edit-address');
        
        if (editName) editName.value = currentUser.name;
        if (editEmail) editEmail.value = currentUser.email;
        if (editAddress) editAddress.value = currentUser.address;
    }
    
    // Clear any error messages
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.className = 'message hidden';
    }
}

// Logout function
function logout() {
    console.log('Logout function called');
    
    // Confirm logout
    if (confirm('Are you sure you want to logout?')) {
        console.log('User confirmed logout');
        
        // Clear user session
        localStorage.removeItem('currentUser');
        
        // Show logout message
        showMessage('Logged out successfully. Redirecting to login page...', 'success');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
            console.log('Redirecting to login page...');
            window.location.href = '/Common frontend HTML/login.html';
        }, 1500);
    } else {
        console.log('User cancelled logout');
    }
}

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

// Global functions that can be called from HTML
window.logout = logout;
window.showVolunteerForm = showVolunteerForm;
window.hideVolunteerForm = hideVolunteerForm;
window.cancelEdit = cancelEdit;

// Debug function to check localStorage
function debugStorage() {
    console.log('=== DEBUGGING STORAGE ===');
    console.log('Registered Users:', localStorage.getItem('registeredUsers'));
    console.log('Current User:', localStorage.getItem('currentUser'));
    console.log('All localStorage keys:', Object.keys(localStorage));
}

// Make debug function available globally
window.debugStorage = debugStorage;