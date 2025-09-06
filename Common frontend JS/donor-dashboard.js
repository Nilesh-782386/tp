// donor-dashboard.js - Donor-specific dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('Donor Dashboard page loading...');
    
    // Check authentication and user type
    if (!checkAuthentication() || !checkUserType('donor')) {
        return;
    }

    // Initialize donor dashboard
    initializeDonorDashboard();
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

function checkUserType(expectedType) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) return false;
    
    const userType = currentUser.userType || 'donor';
    if (userType !== expectedType) {
        console.log(`User type mismatch. Expected: ${expectedType}, Got: ${userType}`);
        // Redirect to appropriate dashboard
        redirectToCorrectDashboard(userType);
        return false;
    }
    return true;
}

function redirectToCorrectDashboard(userType) {
    const dashboardUrls = {
        donor: '/Common frontend HTML/donor-dashboard.html',
        volunteer: '/Common frontend HTML/volunteer-dashboard.html',
        ngo: '/Common frontend HTML/ngo-dashboard.html'
    };
    
    const redirectUrl = dashboardUrls[userType] || '/Common frontend HTML/donor-dashboard.html';
    window.location.href = redirectUrl;
}

function initializeDonorDashboard() {
    console.log('Initializing donor dashboard...');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) return;

    // Update user information
    updateUserProfile(currentUser);
    
    // Load donor statistics
    loadDonorStatistics(currentUser);
    
    // Load donation history
    loadDonationHistory(currentUser);
    
    console.log('Donor dashboard initialized successfully');
}

function updateUserProfile(user) {
    console.log('Updating donor profile display');
    
    // Update profile header
    const userName = document.getElementById('user-name');
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    
    if (userName) userName.textContent = user.name;
    if (avatarPlaceholder) {
        avatarPlaceholder.textContent = user.name.charAt(0).toUpperCase();
    }
    
    // Update profile information cards
    const userEmail = document.getElementById('user-email');
    const userMobile = document.getElementById('user-mobile');
    const userAddress = document.getElementById('user-address');
    const memberSince = document.getElementById('member-since');
    const bloodGroup = document.getElementById('blood-group');
    const lastDonation = document.getElementById('last-donation');
    
    if (userEmail) userEmail.textContent = user.email;
    if (userMobile) userMobile.textContent = user.mobile;
    if (userAddress) userAddress.textContent = user.address;
    
    // Get full user data for additional info
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const fullUser = users.find(u => u.user_id === user.user_id);
    
    if (memberSince && fullUser && fullUser.registration_date) {
        const regDate = new Date(fullUser.registration_date);
        memberSince.textContent = regDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else if (memberSince) {
        memberSince.textContent = 'Recently joined';
    }
    
    // Update donor-specific fields
    if (bloodGroup && fullUser && fullUser.donor_data && fullUser.donor_data.blood_group) {
        bloodGroup.textContent = fullUser.donor_data.blood_group;
    }
    
    if (lastDonation && fullUser && fullUser.donor_data && fullUser.donor_data.last_donation) {
        const lastDate = new Date(fullUser.donor_data.last_donation);
        lastDonation.textContent = lastDate.toLocaleDateString('en-US');
    }
    
    // Update edit form with current values
    const editName = document.getElementById('edit-name');
    const editEmail = document.getElementById('edit-email');
    const editMobile = document.getElementById('edit-mobile');
    const editAddress = document.getElementById('edit-address');
    const bloodGroupSelect = document.getElementById('blood-group-select');
    
    if (editName) editName.value = user.name;
    if (editEmail) editEmail.value = user.email;
    if (editMobile) editMobile.value = user.mobile;
    if (editAddress) editAddress.value = user.address;
    if (bloodGroupSelect && fullUser && fullUser.donor_data && fullUser.donor_data.blood_group) {
        bloodGroupSelect.value = fullUser.donor_data.blood_group;
    }
}

function loadDonorStatistics(user) {
    console.log('Loading donor statistics');
    
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const fullUser = users.find(u => u.user_id === user.user_id);
    
    let stats = {
        blood_donations: 0,
        money_donated: 0,
        items_donated: 0,
        lives_impacted: 0
    };
    
    if (fullUser && fullUser.donor_data && fullUser.donor_data.statistics) {
        stats = { ...stats, ...fullUser.donor_data.statistics };
    }
    
    // Update statistics display
    const bloodDonations = document.getElementById('blood-donations');
    const moneyDonated = document.getElementById('money-donated');
    const itemsDonated = document.getElementById('items-donated');
    const livesImpacted = document.getElementById('lives-impacted');
    
    if (bloodDonations) bloodDonations.textContent = stats.blood_donations;
    if (moneyDonated) moneyDonated.textContent = `₹${stats.money_donated.toLocaleString()}`;
    if (itemsDonated) itemsDonated.textContent = stats.items_donated;
    if (livesImpacted) livesImpacted.textContent = stats.lives_impacted;
}

function loadDonationHistory(user) {
    console.log('Loading donation history');
    
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const fullUser = users.find(u => u.user_id === user.user_id);
    
    const donationList = document.getElementById('donation-list');
    if (!donationList) return;
    
    let donations = [];
    if (fullUser && fullUser.donor_data && fullUser.donor_data.donations) {
        donations = fullUser.donor_data.donations;
    }
    
    if (donations.length === 0) {
        donationList.innerHTML = `
            <div class="no-donations">
                <p>No donations recorded yet. Start making a difference today!</p>
            </div>
        `;
        return;
    }
    
    // Sort donations by date (newest first)
    donations.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    donations.slice(0, 5).forEach(donation => { // Show only latest 5
        html += `
            <div class="donation-item">
                <div class="donation-icon">${getDonationIcon(donation.type)}</div>
                <div class="donation-details">
                    <h4>${getDonationTypeLabel(donation.type)}</h4>
                    <p>${donation.amount || 'Not specified'}</p>
                    <small>${new Date(donation.date).toLocaleDateString()}</small>
                    ${donation.recipient_org ? `<small>To: ${donation.recipient_org}</small>` : ''}
                </div>
            </div>
        `;
    });
    
    if (donations.length > 5) {
        html += `<p class="view-all"><a href="#" onclick="viewAllDonations()">View all ${donations.length} donations</a></p>`;
    }
    
    donationList.innerHTML = html;
}

function getDonationIcon(type) {
    const icons = {
        blood: '🩸',
        money: '💰',
        items: '📦'
    };
    return icons[type] || '💝';
}

function getDonationTypeLabel(type) {
    const labels = {
        blood: 'Blood Donation',
        money: 'Money Donation',
        items: 'Items Donation'
    };
    return labels[type] || 'Donation';
}

function setupEventListeners() {
    console.log('Setting up donor dashboard event listeners...');
    
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Donation form submission
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationSubmission);
    }
    
    console.log('Event listeners set up successfully');
}

function handleProfileUpdate(e) {
    e.preventDefault();
    console.log('Donor profile update form submitted');
    
    const formData = new FormData(e.target);
    const updatedData = {
        name: formData.get('name').trim(),
        email: formData.get('email').trim().toLowerCase(),
        address: formData.get('address').trim(),
        blood_group: formData.get('blood_group')
    };
    
    // Validate the updated data
    if (!validateProfileUpdate(updatedData)) {
        return;
    }
    
    // Update donor profile
    updateDonorProfile_localStorage(updatedData);
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

function updateDonorProfile_localStorage(updatedData) {
    console.log('Updating donor profile in localStorage');
    
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
        
        // Initialize donor_data if not exists
        if (!users[userIndex].donor_data) {
            users[userIndex].donor_data = {
                blood_group: '',
                statistics: {
                    blood_donations: 0,
                    money_donated: 0,
                    items_donated: 0,
                    lives_impacted: 0
                },
                donations: []
            };
        }
        
        // Update user data
        users[userIndex].name = updatedData.name;
        users[userIndex].email = updatedData.email;
        users[userIndex].address = updatedData.address;
        
        // Update donor-specific data
        if (updatedData.blood_group) {
            users[userIndex].donor_data.blood_group = updatedData.blood_group;
        }
        
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
        console.log('Donor profile updated successfully');
        
    } catch (error) {
        console.error('Error updating donor profile:', error);
        showMessage('Failed to update profile. Please try again.', 'error');
    }
}

function handleDonationSubmission(e) {
    e.preventDefault();
    console.log('Donation record form submitted');
    
    const formData = new FormData(e.target);
    const donationData = {
        type: formData.get('donation_type'),
        amount: formData.get('amount').trim(),
        date: formData.get('donation_date'),
        recipient_org: formData.get('recipient_org').trim(),
        notes: formData.get('notes').trim()
    };
    
    // Validate donation data
    if (!validateDonationData(donationData)) {
        return;
    }
    
    // Add donation record
    addDonationRecord_localStorage(donationData);
}

function validateDonationData(data) {
    const messageDiv = document.getElementById('message');
    
    // Clear previous messages
    if (messageDiv) {
        messageDiv.className = 'message hidden';
        messageDiv.innerHTML = '';
    }
    
    // Validate required fields
    if (!data.type) {
        showMessage('Donation type is required', 'error');
        return false;
    }
    
    if (!data.date) {
        showMessage('Donation date is required', 'error');
        return false;
    }
    
    // Validate date is not in future
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (selectedDate > today) {
        showMessage('Donation date cannot be in the future', 'error');
        return false;
    }
    
    return true;
}

function addDonationRecord_localStorage(donationData) {
    console.log('Adding donation record to localStorage');
    
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
        
        // Initialize donor_data if not exists
        if (!users[userIndex].donor_data) {
            users[userIndex].donor_data = {
                blood_group: '',
                statistics: {
                    blood_donations: 0,
                    money_donated: 0,
                    items_donated: 0,
                    lives_impacted: 0
                },
                donations: []
            };
        }
        
        // Create donation record
        const donation = {
            id: 'DON_' + Date.now(),
            type: donationData.type,
            amount: donationData.amount,
            date: donationData.date,
            recipient_org: donationData.recipient_org,
            notes: donationData.notes,
            created_at: new Date().toISOString()
        };
        
        // Add to donations array
        users[userIndex].donor_data.donations.push(donation);
        
        // Update statistics
        const stats = users[userIndex].donor_data.statistics;
        switch (donationData.type) {
            case 'blood':
                stats.blood_donations += 1;
                stats.lives_impacted += 3; // Assume 1 blood donation can save 3 lives
                users[userIndex].donor_data.last_donation = donationData.date;
                break;
            case 'money':
                const amount = parseFloat(donationData.amount.replace(/[^\d.]/g, '')) || 0;
                stats.money_donated += amount;
                stats.lives_impacted += Math.floor(amount / 1000); // Assume ₹1000 impacts 1 life
                break;
            case 'items':
                const itemCount = parseInt(donationData.amount.replace(/[^\d]/g, '')) || 1;
                stats.items_donated += itemCount;
                stats.lives_impacted += itemCount;
                break;
        }
        
        // Save to localStorage
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        // Update UI
        loadDonorStatistics(currentUser);
        loadDonationHistory(currentUser);
        updateUserProfile(currentUser);
        
        // Hide form and show success message
        hideDonationForm();
        showMessage('Donation record added successfully!', 'success');
        console.log('Donation record added successfully');
        
    } catch (error) {
        console.error('Error adding donation record:', error);
        showMessage('Failed to add donation record. Please try again.', 'error');
    }
}

function addDonationRecord() {
    console.log('Showing add donation form');
    const formSection = document.getElementById('add-donation-section');
    if (formSection) {
        formSection.classList.remove('hidden');
        formSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function cancelDonation() {
    console.log('Cancelling donation form');
    hideDonationForm();
}

function hideDonationForm() {
    const formSection = document.getElementById('add-donation-section');
    if (formSection) {
        formSection.classList.add('hidden');
    }
    
    // Clear form
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.reset();
    }
}

function viewAllDonations() {
    console.log('Viewing all donations');
    // This could open a modal or navigate to a detailed donations page
    alert('Feature coming soon: View all donations in detail');
}

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

// Global functions that can be called from HTML
window.logout = logout;
window.addDonationRecord = addDonationRecord;
window.cancelDonation = cancelDonation;
window.cancelEdit = cancelEdit;
window.viewAllDonations = viewAllDonations;

// Debug function to check localStorage
function debugStorage() {
    console.log('=== DEBUGGING DONOR STORAGE ===');
    console.log('Registered Users:', localStorage.getItem('registeredUsers'));
    console.log('Current User:', localStorage.getItem('currentUser'));
    console.log('All localStorage keys:', Object.keys(localStorage));
}

// Make debug function available globally
window.debugStorage = debugStorage;