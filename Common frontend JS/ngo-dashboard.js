// ngo-dashboard.js - NGO-specific dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('NGO Dashboard page loading...');
    
    // Check authentication and user type
    if (!checkAuthentication() || !checkUserType('ngo')) {
        return;
    }

    // Initialize NGO dashboard
    initializeNGODashboard();
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

function initializeNGODashboard() {
    console.log('Initializing NGO dashboard...');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) return;

    // Update organization information
    updateOrganizationProfile(currentUser);
    
    // Load NGO statistics
    loadNGOStatistics(currentUser);
    
    // Load projects
    loadProjects(currentUser);
    
    // Load donation requests
    loadDonationRequests(currentUser);
    
    // Load volunteer applications
    loadVolunteerApplications(currentUser);
    
    console.log('NGO dashboard initialized successfully');
}

function updateOrganizationProfile(user) {
    console.log('Updating NGO profile display');
    
    // Update profile header
    const orgName = document.getElementById('org-name');
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    
    if (orgName) orgName.textContent = user.name || user.organization_name;
    if (avatarPlaceholder) {
        const displayName = user.name || user.organization_name || 'N';
        avatarPlaceholder.textContent = displayName.charAt(0).toUpperCase();
    }
    
    // Update profile information cards
    const orgEmail = document.getElementById('org-email');
    const orgMobile = document.getElementById('org-mobile');
    const orgAddress = document.getElementById('org-address');
    const memberSince = document.getElementById('member-since');
    const registrationNumber = document.getElementById('registration-number');
    const focusAreas = document.getElementById('focus-areas');
    const verificationStatus = document.getElementById('verification-status');
    const orgRating = document.getElementById('org-rating');
    
    if (orgEmail) orgEmail.textContent = user.email;
    if (orgMobile) orgMobile.textContent = user.mobile;
    if (orgAddress) orgAddress.textContent = user.address;
    
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
    
    // Update NGO-specific fields
    if (fullUser && fullUser.ngo_data) {
        const ngoData = fullUser.ngo_data;
        if (registrationNumber) registrationNumber.textContent = ngoData.registration_number || user.registration_number || 'Not provided';
        if (focusAreas) focusAreas.textContent = ngoData.focus_areas || 'Not specified';
        if (verificationStatus) verificationStatus.textContent = ngoData.verification_status || 'Pending';
        if (orgRating && ngoData.rating) orgRating.textContent = ngoData.rating.toFixed(1);
    } else {
        if (registrationNumber) registrationNumber.textContent = user.registration_number || 'Not provided';
    }
    
    // Update edit form with current values
    const editName = document.getElementById('edit-name');
    const editEmail = document.getElementById('edit-email');
    const editMobile = document.getElementById('edit-mobile');
    const editAddress = document.getElementById('edit-address');
    const editRegistration = document.getElementById('edit-registration');
    const editFocus = document.getElementById('edit-focus');
    
    if (editName) editName.value = user.name || user.organization_name || '';
    if (editEmail) editEmail.value = user.email;
    if (editMobile) editMobile.value = user.mobile;
    if (editAddress) editAddress.value = user.address;
    if (editRegistration) editRegistration.value = user.registration_number || '';
    
    if (fullUser && fullUser.ngo_data) {
        if (editFocus) editFocus.value = fullUser.ngo_data.focus_areas || '';
    }
}

function loadNGOStatistics(user) {
    console.log('Loading NGO statistics');
    
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const fullUser = users.find(u => u.user_id === user.user_id);
    
    let stats = {
        funds_received: 0,
        beneficiaries_served: 0,
        volunteers_connected: 0,
        projects_completed: 0
    };
    
    if (fullUser && fullUser.ngo_data && fullUser.ngo_data.statistics) {
        stats = { ...stats, ...fullUser.ngo_data.statistics };
    }
    
    // Update statistics display
    const fundsReceived = document.getElementById('funds-received');
    const beneficiariesServed = document.getElementById('beneficiaries-served');
    const volunteersConnected = document.getElementById('volunteers-connected');
    const projectsCompleted = document.getElementById('projects-completed');
    
    if (fundsReceived) fundsReceived.textContent = `₹${stats.funds_received.toLocaleString()}`;
    if (beneficiariesServed) beneficiariesServed.textContent = stats.beneficiaries_served;
    if (volunteersConnected) volunteersConnected.textContent = stats.volunteers_connected;
    if (projectsCompleted) projectsCompleted.textContent = stats.projects_completed;
}

function loadProjects(user) {
    console.log('Loading NGO projects');
    
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const fullUser = users.find(u => u.user_id === user.user_id);
    
    const projectsList = document.getElementById('projects-list');
    if (!projectsList) return;
    
    let projects = [];
    if (fullUser && fullUser.ngo_data && fullUser.ngo_data.projects) {
        projects = fullUser.ngo_data.projects;
    }
    
    if (projects.length === 0) {
        projectsList.innerHTML = `
            <div class="no-projects">
                <p>No active projects. Create your first project to start making an impact!</p>
            </div>
        `;
        return;
    }
    
    // Sort projects by created date (newest first)
    projects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    let html = '';
    projects.slice(0, 5).forEach(project => {
        const progress = calculateProjectProgress(project);
        html += `
            <div class="project-item">
                <div class="project-header">
                    <h4>${project.title}</h4>
                    <span class="project-status ${project.status}">${project.status}</span>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <span>📍 ${project.location || 'Not specified'}</span>
                    <span>💰 ₹${(project.budget || 0).toLocaleString()}</span>
                    <span>👥 ${project.target_beneficiaries || 0} beneficiaries</span>
                </div>
                <div class="project-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress}% Complete</span>
                </div>
                <div class="project-actions">
                    <button class="btn btn-sm btn-outline" onclick="viewProject('${project.id}')">View Details</button>
                    <button class="btn btn-sm btn-primary" onclick="editProject('${project.id}')">Edit</button>
                </div>
            </div>
        `;
    });
    
    if (projects.length > 5) {
        html += `<p class="view-all"><a href="#" onclick="viewAllProjects()">View all ${projects.length} projects</a></p>`;
    }
    
    projectsList.innerHTML = html;
}

function calculateProjectProgress(project) {
    if (!project.start_date || !project.end_date) return 0;
    
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
}

function loadDonationRequests(user) {
    console.log('Loading donation requests');
    
    const requestsList = document.getElementById('requests-list');
    if (!requestsList) return;
    
    // Sample data - in real app, this would come from backend
    requestsList.innerHTML = `
        <div class="no-requests">
            <p>No donation requests yet. Create projects to receive donations!</p>
        </div>
    `;
}

function loadVolunteerApplications(user) {
    console.log('Loading volunteer applications');
    
    const applicationsList = document.getElementById('applications-list');
    if (!applicationsList) return;
    
    // Sample data - in real app, this would come from backend
    applicationsList.innerHTML = `
        <div class="no-applications">
            <p>No volunteer applications yet. Post volunteer opportunities to get applications!</p>
        </div>
    `;
}

function setupEventListeners() {
    console.log('Setting up NGO dashboard event listeners...');
    
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Project form submission
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectSubmission);
    }
    
    console.log('Event listeners set up successfully');
}

function handleProfileUpdate(e) {
    e.preventDefault();
    console.log('NGO profile update form submitted');
    
    const formData = new FormData(e.target);
    const updatedData = {
        name: formData.get('name').trim(),
        email: formData.get('email').trim().toLowerCase(),
        address: formData.get('address').trim(),
        focus_areas: formData.get('focus_areas').trim()
    };
    
    // Validate the updated data
    if (!validateProfileUpdate(updatedData)) {
        return;
    }
    
    // Update NGO profile
    updateNGOProfile_localStorage(updatedData);
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
        showMessage('Organization name must be at least 2 characters long', 'error');
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

function updateNGOProfile_localStorage(updatedData) {
    console.log('Updating NGO profile in localStorage');
    
    try {
        // Get current user session
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!currentUser) return;
        
        // Get all registered users
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = users.findIndex(u => u.user_id === currentUser.user_id);
        
        if (userIndex === -1) {
            showMessage('Organization not found', 'error');
            return;
        }
        
        // Initialize ngo_data if not exists
        if (!users[userIndex].ngo_data) {
            users[userIndex].ngo_data = {
                registration_number: users[userIndex].registration_number || '',
                focus_areas: '',
                verification_status: 'Pending',
                rating: 5.0,
                statistics: {
                    funds_received: 0,
                    beneficiaries_served: 0,
                    volunteers_connected: 0,
                    projects_completed: 0
                },
                projects: [],
                campaigns: [],
                volunteer_opportunities: []
            };
        }
        
        // Update user data
        users[userIndex].name = updatedData.name;
        users[userIndex].organization_name = updatedData.name;
        users[userIndex].email = updatedData.email;
        users[userIndex].address = updatedData.address;
        
        // Update NGO-specific data
        users[userIndex].ngo_data.focus_areas = updatedData.focus_areas;
        
        // Update current session
        currentUser.name = updatedData.name;
        currentUser.organization_name = updatedData.name;
        currentUser.email = updatedData.email;
        currentUser.address = updatedData.address;
        
        // Save to localStorage
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI
        updateOrganizationProfile(currentUser);
        
        showMessage('Organization profile updated successfully!', 'success');
        console.log('NGO profile updated successfully');
        
    } catch (error) {
        console.error('Error updating NGO profile:', error);
        showMessage('Failed to update profile. Please try again.', 'error');
    }
}

function handleProjectSubmission(e) {
    e.preventDefault();
    console.log('Project form submitted');
    
    const formData = new FormData(e.target);
    const projectData = {
        title: formData.get('title').trim(),
        category: formData.get('category'),
        target_beneficiaries: parseInt(formData.get('target_beneficiaries')) || 0,
        budget: parseFloat(formData.get('budget')) || 0,
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        description: formData.get('description').trim(),
        location: formData.get('location').trim()
    };
    
    // Validate project data
    if (!validateProjectData(projectData)) {
        return;
    }
    
    // Add project
    addProject_localStorage(projectData);
}

function validateProjectData(data) {
    const messageDiv = document.getElementById('message');
    
    // Clear previous messages
    if (messageDiv) {
        messageDiv.className = 'message hidden';
        messageDiv.innerHTML = '';
    }
    
    // Validate required fields
    if (!data.title || data.title.length < 3) {
        showMessage('Project title must be at least 3 characters long', 'error');
        return false;
    }
    
    if (!data.category) {
        showMessage('Please select a project category', 'error');
        return false;
    }
    
    if (!data.description || data.description.length < 20) {
        showMessage('Project description must be at least 20 characters long', 'error');
        return false;
    }
    
    // Validate dates
    if (data.start_date && data.end_date) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        
        if (endDate <= startDate) {
            showMessage('End date must be after start date', 'error');
            return false;
        }
    }
    
    return true;
}

function addProject_localStorage(projectData) {
    console.log('Adding project to localStorage');
    
    try {
        // Get current user session
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!currentUser) return;
        
        // Get all registered users
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = users.findIndex(u => u.user_id === currentUser.user_id);
        
        if (userIndex === -1) {
            showMessage('Organization not found', 'error');
            return;
        }
        
        // Initialize ngo_data if not exists
        if (!users[userIndex].ngo_data) {
            users[userIndex].ngo_data = {
                registration_number: users[userIndex].registration_number || '',
                focus_areas: '',
                verification_status: 'Pending',
                rating: 5.0,
                statistics: {
                    funds_received: 0,
                    beneficiaries_served: 0,
                    volunteers_connected: 0,
                    projects_completed: 0
                },
                projects: [],
                campaigns: [],
                volunteer_opportunities: []
            };
        }
        
        // Create project record
        const project = {
            id: 'PROJ_' + Date.now(),
            title: projectData.title,
            category: projectData.category,
            target_beneficiaries: projectData.target_beneficiaries,
            budget: projectData.budget,
            start_date: projectData.start_date,
            end_date: projectData.end_date,
            description: projectData.description,
            location: projectData.location,
            status: 'Active',
            created_at: new Date().toISOString(),
            funds_raised: 0,
            beneficiaries_reached: 0
        };
        
        // Add to projects array
        users[userIndex].ngo_data.projects.push(project);
        
        // Save to localStorage
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        // Update UI
        loadProjects(currentUser);
        
        // Hide form and show success message
        hideProjectForm();
        showMessage('Project created successfully!', 'success');
        console.log('Project added successfully');
        
    } catch (error) {
        console.error('Error adding project:', error);
        showMessage('Failed to create project. Please try again.', 'error');
    }
}

function addProject() {
    console.log('Showing add project form');
    const formSection = document.getElementById('add-project-section');
    if (formSection) {
        formSection.classList.remove('hidden');
        formSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function cancelProject() {
    console.log('Cancelling project form');
    hideProjectForm();
}

function hideProjectForm() {
    const formSection = document.getElementById('add-project-section');
    if (formSection) {
        formSection.classList.add('hidden');
    }
    
    // Clear form
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.reset();
    }
}

function viewProject(projectId) {
    console.log('Viewing project:', projectId);
    alert('Feature coming soon: View project details');
}

function editProject(projectId) {
    console.log('Editing project:', projectId);
    alert('Feature coming soon: Edit project');
}

function viewAllProjects() {
    console.log('Viewing all projects');
    alert('Feature coming soon: View all projects');
}

function cancelEdit() {
    console.log('Cancelling profile edit');
    
    // Reset form to original values
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
        const editName = document.getElementById('edit-name');
        const editEmail = document.getElementById('edit-email');
        const editAddress = document.getElementById('edit-address');
        const editFocus = document.getElementById('edit-focus');
        
        if (editName) editName.value = currentUser.name || currentUser.organization_name || '';
        if (editEmail) editEmail.value = currentUser.email;
        if (editAddress) editAddress.value = currentUser.address;
        if (editFocus) editFocus.value = '';
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
    
    if (confirm('Are you sure you want to logout?')) {
        console.log('User confirmed logout');
        localStorage.removeItem('currentUser');
        showMessage('Logged out successfully. Redirecting to login page...', 'success');
        
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
window.addProject = addProject;
window.cancelProject = cancelProject;
window.cancelEdit = cancelEdit;
window.viewProject = viewProject;
window.editProject = editProject;
window.viewAllProjects = viewAllProjects;

// Debug function
function debugStorage() {
    console.log('=== DEBUGGING NGO STORAGE ===');
    console.log('Registered Users:', localStorage.getItem('registeredUsers'));
    console.log('Current User:', localStorage.getItem('currentUser'));
    console.log('All localStorage keys:', Object.keys(localStorage));
}

window.debugStorage = debugStorage;