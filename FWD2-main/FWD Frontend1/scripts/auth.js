const API_BASE_URL = 'http://localhost:5000/api';

// User authentication state
let currentUser = null;

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
}

// Login function
async function login(orgId, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orgId, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        currentUser = data.user;

        // Redirect based on user type
        if (data.user.type === 'ngo') {
            window.location.href = 'ngo-dashboard.html';
        } else if (data.user.type === 'restaurant') {
            window.location.href = 'restaurant-dashboard.html';
        }
    } catch (error) {
        throw error;
    }
}

// Signup function
async function signup(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Signup failed');
        }

        const data = await response.json();
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        currentUser = data.user;

        // Redirect based on user type
        if (data.user.type === 'ngo') {
            window.location.href = 'ngo-dashboard.html';
        } else if (data.user.type === 'restaurant') {
            window.location.href = 'restaurant-dashboard.html';
        }
    } catch (error) {
        throw error;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'login.html';
}

// Get authenticated user
function getCurrentUser() {
    if (!currentUser) {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            currentUser = JSON.parse(userStr);
        }
    }
    return currentUser;
}

// Update user profile
async function updateProfile(profileData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }

        const data = await response.json();
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        currentUser = data.user;
        return data.user;
    } catch (error) {
        throw error;
    }
}

// Get user profile
async function getProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to get profile');
        }

        const data = await response.json();
        return data.user;
    } catch (error) {
        throw error;
    }
}

// Check authentication status and redirect if needed
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Export functions
window.isAuthenticated = isAuthenticated;
window.login = login;
window.signup = signup;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.updateProfile = updateProfile;
window.getProfile = getProfile;
window.requireAuth = requireAuth; 