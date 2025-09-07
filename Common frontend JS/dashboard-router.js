// dashboard-router.js - Centralized dashboard routing and common functionality

class DashboardRouter {
    constructor() {
        this.currentUser = null;
        this.userType = null;
        this.dashboardConfig = {
            donor: {
                url: '/Common frontend HTML/donor-dashboard.html',
                script: '/Common frontend JS/donor-dashboard.js',
                features: ['donations', 'statistics', 'profile'],
                role: 'Donor',
                dataKey: 'donor_data',
                defaultData: {
                    blood_group: '',
                    statistics: {
                        blood_donations: 0,
                        money_donated: 0,
                        items_donated: 0,
                        lives_impacted: 0
                    },
                    donations: [],
                    last_donation: null
                }
            },
            volunteer: {
                url: '/Common frontend HTML/volunteer-dashboard.html',
                script: '/Common frontend JS/volunteer-dashboard.js',
                features: ['activities', 'opportunities', 'hours', 'profile'],
                role: 'Volunteer',
                dataKey: 'volunteer_data',
                defaultData: {
                    skills: '',
                    availability: '',
                    preferred_location: '',
                    status: 'Active',
                    statistics: {
                        hours_volunteered: 0,
                        events_participated: 0,
                        people_helped: 0,
                        rating: 5.0
                    },
                    activities: []
                }
            },
            ngo: {
                url: '/Common frontend HTML/ngo-dashboard.html',
                script: '/Common frontend JS/ngo-dashboard.js',
                features: ['projects', 'campaigns', 'volunteers', 'donations', 'profile'],
                role: 'NGO',
                dataKey: 'ngo_data',
                defaultData: {
                    registration_number: '',
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
                }
            }
        };
        
        // Common routes
        this.commonRoutes = {
            login: '/Common frontend HTML/login.html',
            signup: '/Common frontend HTML/signup.html',
            home: '/Common frontend HTML/index.html',
            about: '/Common frontend HTML/about.html',
            donate: '/Common frontend HTML/donate.html',
            volunteer: '/Common frontend HTML/volunteer.html',
            ngo: '/Common frontend HTML/ngo.html'
        };
    }

    // Initialize the router
    init() {
        console.log('=== Dashboard Router Initializing ===');
        
        // Load user session
        this.loadUserSession();
        
        // Check authentication
        if (!this.checkAuthentication()) {
            console.log('Authentication failed, redirecting to login');
            this.redirectToLogin();
            return false;
        }
        
        // Determine user type
        this.determineUserType();
        
        // Validate dashboard access
        if (!this.validateDashboardAccess()) {
            return false;
        }
        
        // Initialize user data structure if needed
        this.ensureUserDataStructure();
        
        console.log('=== Router Initialization Complete ===');
        return true;
    }

    // Load user session from localStorage
    loadUserSession() {
        try {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            
            if (this.currentUser) {
                console.log('User session loaded:', {
                    name: this.currentUser.name,
                    email: this.currentUser.email,
                    userType: this.currentUser.userType,
                    userId: this.currentUser.user_id
                });
            } else {
                console.log('No active user session found');
            }
        } catch (error) {
            console.error('Error loading user session:', error);
            this.currentUser = null;
        }
    }

    // Check if user is authenticated
    checkAuthentication() {
        if (!this.currentUser) {
            console.log('No authenticated user found');
            return false;
        }
        
        // Validate required fields
        if (!this.currentUser.user_id || !this.currentUser.email) {
            console.log('Invalid user session data');
            this.clearSession();
            return false;
        }
        
        // Check session expiry (24 hours)
        if (this.isSessionExpired()) {
            console.log('Session expired');
            this.clearSession();
            return false;
        }
        
        return true;
    }

    // Check if session is expired (24 hours)
    isSessionExpired() {
        if (!this.currentUser || !this.currentUser.loginTime) {
            return false;
        }
        
        const loginTime = new Date(this.currentUser.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
        
        return hoursSinceLogin > 24;
    }

    // Determine user type from session
    determineUserType() {
        if (!this.currentUser) {
            this.userType = null;
            return;
        }
        
        // Priority 1: Check explicit userType field
        if (this.currentUser.userType) {
            this.userType = this.currentUser.userType;
        }
        // Priority 2: Check flags
        else if (this.currentUser.is_ngo === true) {
            this.userType = 'ngo';
        }
        else if (this.currentUser.is_volunteer === true) {
            this.userType = 'volunteer';
        }
        // Priority 3: Default to donor
        else {
            this.userType = 'donor';
        }
        
        console.log('User type determined:', this.userType);
        
        // Update session with determined type
        this.currentUser.userType = this.userType;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    // Validate if user has access to current dashboard
    validateDashboardAccess() {
        const currentPath = window.location.pathname;
        const expectedDashboard = `${this.userType}-dashboard`;
        
        console.log('Validating dashboard access:', {
            currentPath,
            expectedDashboard,
            userType: this.userType
        });
        
        // Check if user type is valid
        if (!this.dashboardConfig[this.userType]) {
            console.error('Invalid user type:', this.userType);
            this.redirectToLogin();
            return false;
        }
        
        // Allow access to dashboard.html for generic dashboard
        if (currentPath.includes('dashboard.html') && !currentPath.includes('-dashboard.html')) {
            console.log('Redirecting from generic dashboard to specific dashboard');
            this.redirectToCorrectDashboard();
            return false;
        }
        
        // Check if user is on the correct dashboard
        if (!currentPath.includes(expectedDashboard)) {
            console.log('User on wrong dashboard, redirecting to correct dashboard');
            this.redirectToCorrectDashboard();
            return false;
        }
        
        return true;
    }

    // Ensure user data structure is properly initialized
    ensureUserDataStructure() {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = users.findIndex(u => u.user_id === this.currentUser.user_id);
        
        if (userIndex === -1) {
            console.error('User not found in registered users');
            return;
        }
        
        const config = this.dashboardConfig[this.userType];
        const dataKey = config.dataKey;
        
        // Initialize type-specific data if not exists
        if (!users[userIndex][dataKey]) {
            console.log(`Initializing ${dataKey} for user`);
            users[userIndex][dataKey] = JSON.parse(JSON.stringify(config.defaultData));
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            console.log(`${dataKey} initialized:`, users[userIndex][dataKey]);
        }
    }

    // Redirect to correct dashboard based on user type
    redirectToCorrectDashboard() {
        const config = this.dashboardConfig[this.userType];
        if (config && config.url) {
            console.log(`Redirecting to ${this.userType} dashboard`);
            window.location.href = config.url;
        } else {
            this.redirectToLogin();
        }
    }

    // Redirect to login page
    redirectToLogin() {
        console.log('Redirecting to login page');
        this.clearSession();
        window.location.href = this.commonRoutes.login;
    }

    // Navigate to a specific route
    navigateTo(route) {
        if (this.commonRoutes[route]) {
            window.location.href = this.commonRoutes[route];
        } else if (this.dashboardConfig[route]) {
            window.location.href = this.dashboardConfig[route].url;
        } else {
            console.error('Unknown route:', route);
        }
    }

    // Clear user session
    clearSession() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.userType = null;
        console.log('User session cleared');
    }

    // Get full user details from storage
    getUserDetails() {
        if (!this.currentUser) return null;
        
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        return users.find(u => u.user_id === this.currentUser.user_id);
    }

    // Update user profile
    updateUserProfile(updates) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userIndex = users.findIndex(u => u.user_id === this.currentUser.user_id);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }
            
            // Update user data
            Object.assign(users[userIndex], updates);
            
            // Update current session
            Object.assign(this.currentUser, updates);
            
            // Save to localStorage
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            console.log('User profile updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating user profile:', error);
            return false;
        }
    }

    // Update type-specific data (donor_data, volunteer_data, ngo_data)
    updateTypeSpecificData(dataUpdates) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userIndex = users.findIndex(u => u.user_id === this.currentUser.user_id);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }
            
            const config = this.dashboardConfig[this.userType];
            const dataKey = config.dataKey;
            
            // Ensure data structure exists
            if (!users[userIndex][dataKey]) {
                users[userIndex][dataKey] = JSON.parse(JSON.stringify(config.defaultData));
            }
            
            // Update type-specific data
            Object.assign(users[userIndex][dataKey], dataUpdates);
            
            // Save to localStorage
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            console.log(`${dataKey} updated successfully`);
            return true;
        } catch (error) {
            console.error('Error updating type-specific data:', error);
            return false;
        }
    }

    // Get statistics for current user
    getStatistics() {
        const fullUser = this.getUserDetails();
        if (!fullUser) return null;
        
        const config = this.dashboardConfig[this.userType];
        const dataKey = config.dataKey;
        
        return fullUser[dataKey]?.statistics || config.defaultData.statistics;
    }

    // Add activity/donation/project based on user type
    addRecord(recordType, recordData) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userIndex = users.findIndex(u => u.user_id === this.currentUser.user_id);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }
            
            const config = this.dashboardConfig[this.userType];
            const dataKey = config.dataKey;
            
            // Map record types to array keys
            const recordArrayMap = {
                donor: { donation: 'donations' },
                volunteer: { activity: 'activities' },
                ngo: { 
                    project: 'projects', 
                    campaign: 'campaigns', 
                    opportunity: 'volunteer_opportunities' 
                }
            };
            
            const arrayKey = recordArrayMap[this.userType]?.[recordType];
            if (!arrayKey) {
                throw new Error(`Invalid record type: ${recordType} for user type: ${this.userType}`);
            }
            
            // Ensure data structure exists
            if (!users[userIndex][dataKey]) {
                users[userIndex][dataKey] = JSON.parse(JSON.stringify(config.defaultData));
            }
            
            if (!users[userIndex][dataKey][arrayKey]) {
                users[userIndex][dataKey][arrayKey] = [];
            }
            
            // Add record with metadata
            const record = {
                ...recordData,
                id: `${recordType.toUpperCase()}_${Date.now()}`,
                created_at: new Date().toISOString(),
                created_by: this.currentUser.user_id
            };
            
            users[userIndex][dataKey][arrayKey].push(record);
            
            // Update statistics if applicable
            this.updateStatisticsAfterRecord(users[userIndex][dataKey], recordType, recordData);
            
            // Save to localStorage
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            console.log(`${recordType} record added successfully`);
            return record;
        } catch (error) {
            console.error('Error adding record:', error);
            return null;
        }
    }

    // Update statistics after adding a record
    updateStatisticsAfterRecord(userData, recordType, recordData) {
        if (!userData.statistics) {
            userData.statistics = this.dashboardConfig[this.userType].defaultData.statistics;
        }
        
        const stats = userData.statistics;
        
        // Update based on user type and record type
        if (this.userType === 'donor' && recordType === 'donation') {
            if (recordData.type === 'blood') {
                stats.blood_donations += 1;
                stats.lives_impacted += 3; // Assume 1 blood donation can save 3 lives
            } else if (recordData.type === 'money') {
                const amount = parseFloat(recordData.amount) || 0;
                stats.money_donated += amount;
                stats.lives_impacted += Math.floor(amount / 1000); // Assume ₹1000 impacts 1 life
            } else if (recordData.type === 'items') {
                const items = parseInt(recordData.amount) || 1;
                stats.items_donated += items;
                stats.lives_impacted += items;
            }
        } else if (this.userType === 'volunteer' && recordType === 'activity') {
            stats.hours_volunteered += parseFloat(recordData.hours_worked) || 0;
            stats.events_participated += 1;
            stats.people_helped += parseInt(recordData.people_helped) || 0;
        } else if (this.userType === 'ngo' && recordType === 'project') {
            // Projects don't immediately update statistics
            // They update when marked as completed
            console.log('Project added, statistics will update when completed');
        }
    }

    // Check if user has specific feature access
    hasFeature(feature) {
        const config = this.dashboardConfig[this.userType];
        return config && config.features.includes(feature);
    }

    // Get dashboard configuration
    getDashboardConfig() {
        return this.dashboardConfig[this.userType];
    }

    // Get all records for current user
    getRecords(recordType) {
        const fullUser = this.getUserDetails();
        if (!fullUser) return [];
        
        const config = this.dashboardConfig[this.userType];
        const dataKey = config.dataKey;
        
        const recordArrayMap = {
            donor: { donation: 'donations' },
            volunteer: { activity: 'activities' },
            ngo: { 
                project: 'projects', 
                campaign: 'campaigns', 
                opportunity: 'volunteer_opportunities' 
            }
        };
        
        const arrayKey = recordArrayMap[this.userType]?.[recordType];
        if (!arrayKey) return [];
        
        return fullUser[dataKey]?.[arrayKey] || [];
    }

    // Get user type-specific data
    getUserTypeData() {
        const fullUser = this.getUserDetails();
        if (!fullUser) return null;
        
        const config = this.dashboardConfig[this.userType];
        const dataKey = config.dataKey;
        
        return fullUser[dataKey] || null;
    }

    // Update statistics manually (for admin or bulk operations)
    updateStatistics(newStats) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userIndex = users.findIndex(u => u.user_id === this.currentUser.user_id);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }
            
            const config = this.dashboardConfig[this.userType];
            const dataKey = config.dataKey;
            
            // Ensure data structure exists
            if (!users[userIndex][dataKey]) {
                users[userIndex][dataKey] = JSON.parse(JSON.stringify(config.defaultData));
            }
            
            // Update statistics
            Object.assign(users[userIndex][dataKey].statistics, newStats);
            
            // Save to localStorage
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            console.log('Statistics updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating statistics:', error);
            return false;
        }
    }

    // Logout user
    logout() {
        console.log('Logging out user');
        this.clearSession();
        this.redirectToLogin();
    }

    // Get user role display name
    getRoleDisplayName() {
        const config = this.getDashboardConfig();
        return config ? config.role : 'User';
    }

    // Check if current user is of specific type
    isUserType(type) {
        return this.userType === type;
    }

    // Get available user actions based on type and features
    getAvailableActions() {
        const config = this.getDashboardConfig();
        if (!config) return [];
        
        const actionMap = {
            donor: [
                'add_donation',
                'view_statistics',
                'update_blood_group',
                'view_donation_history'
            ],
            volunteer: [
                'add_activity',
                'view_opportunities',
                'update_skills',
                'view_activity_history'
            ],
            ngo: [
                'create_project',
                'create_campaign',
                'post_opportunity',
                'view_applications',
                'generate_report'
            ]
        };
        
        return actionMap[this.userType] || [];
    }

    // Validate user permissions for specific action
    canPerformAction(action) {
        const availableActions = this.getAvailableActions();
        return availableActions.includes(action);
    }

    // Debug function
    debug() {
        console.log('=== DASHBOARD ROUTER DEBUG ===');
        console.log('Current User:', this.currentUser);
        console.log('User Type:', this.userType);
        console.log('Dashboard Config:', this.getDashboardConfig());
        console.log('Full User Details:', this.getUserDetails());
        console.log('Statistics:', this.getStatistics());
        console.log('User Type Data:', this.getUserTypeData());
        console.log('Available Actions:', this.getAvailableActions());
        console.log('Session Expired:', this.isSessionExpired());
        console.log('==============================');
    }
}

// Create global router instance
window.dashboardRouter = new DashboardRouter();

// Auto-initialize on DOM load if on a dashboard page
document.addEventListener('DOMContentLoaded', function() {
    const isDashboardPage = window.location.pathname.includes('-dashboard') || 
                          window.location.pathname.includes('dashboard.html');
    
    if (isDashboardPage) {
        const success = window.dashboardRouter.init();
        
        if (success) {
            console.log('Dashboard router initialized successfully');
            
            // Make router available globally for dashboard scripts
            window.router = window.dashboardRouter;
            
            // Dispatch custom event for dashboard initialization
            window.dispatchEvent(new CustomEvent('dashboardReady', {
                detail: {
                    userType: window.dashboardRouter.userType,
                    config: window.dashboardRouter.getDashboardConfig()
                }
            }));
        }
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    const isDashboardPage = window.location.pathname.includes('-dashboard') || 
                          window.location.pathname.includes('dashboard.html');
    
    if (isDashboardPage && window.dashboardRouter) {
        window.dashboardRouter.init();
    }
});

// Handle page visibility change (when user switches tabs)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.dashboardRouter && window.dashboardRouter.currentUser) {
        // Check if session is still valid when user returns to tab
        if (window.dashboardRouter.isSessionExpired()) {
            console.log('Session expired while away, logging out');
            window.dashboardRouter.logout();
        }
    }
});

// Global error handler for router
window.addEventListener('error', function(event) {
    if (event.error && event.error.message && event.error.message.includes('dashboardRouter')) {
        console.error('Dashboard Router Error:', event.error);
        
        // Try to recover by reinitializing
        if (window.dashboardRouter) {
            setTimeout(() => {
                window.dashboardRouter.init();
            }, 1000);
        }
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardRouter;
}