// API endpoints
const API_ENDPOINTS = {
    donations: '/api/donations',
    profile: '/api/profile'
};

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Form validation
function validateDonationForm(formData) {
    const errors = [];
    if (!formData.get('foodType')) errors.push('Food type is required');
    if (!formData.get('quantity') || formData.get('quantity') <= 0) errors.push('Valid quantity is required');
    if (!formData.get('pickupLocation')) errors.push('Pickup location is required');
    if (!formData.get('availableUntil')) errors.push('Available until time is required');
    return errors;
}

function checkAuth() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    return currentUser;
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Initialize dashboard with user data
function initializeDashboard() {
    const user = checkAuth();
    if (!user) return;

    // Update organization name in the dashboard
    document.querySelector('.organization-name').textContent = user.name;

    // Add logout functionality
    document.querySelector('.logout').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard data
    initializeDashboard();

    // New Donation Form Handling
    const donationForm = document.querySelector('.donation-form');
    donationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const errors = validateDonationForm(formData);
        
        if (errors.length > 0) {
            showToast(errors.join('\n'), 'error');
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.donations, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (!response.ok) throw new Error('Failed to create donation');

            showToast('Donation created successfully!');
            document.getElementById('donationModal').style.display = 'none';
            donationForm.reset();
            refreshDonationsTable();

        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Edit donation handling
    async function handleEdit(row) {
        try {
            const donationId = row.dataset.id;
            const response = await fetch(`${API_ENDPOINTS.donations}/${donationId}`);
            if (!response.ok) throw new Error('Failed to fetch donation details');

            const donation = await response.json();
            
            // Populate modal with existing data
            const modal = document.getElementById('donationModal');
            Object.keys(donation).forEach(key => {
                const input = modal.querySelector(`[name="${key}"]`);
                if (input) input.value = donation[key];
            });

            modal.style.display = 'block';

        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    // Cancel donation handling
    async function handleCancel(row) {
        if (!confirm('Are you sure you want to cancel this donation?')) return;

        try {
            const donationId = row.dataset.id;
            const response = await fetch(`${API_ENDPOINTS.donations}/${donationId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to cancel donation');

            row.remove();
            showToast('Donation cancelled successfully');
            refreshDashboardStats();

        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    // Dashboard initialization
    async function initializeDashboard() {
        try {
            const response = await fetch(API_ENDPOINTS.donations);
            if (!response.ok) throw new Error('Failed to fetch dashboard data');

            const data = await response.json();
            updateDashboardStats(data.stats);
            populateDonationsTable(data.activeDonations);

        } catch (error) {
            showToast('Failed to load dashboard data', 'error');
        }
    }

    // Helper functions
    function updateDashboardStats(stats) {
        document.querySelector('.stat-number:nth-child(1)').textContent = stats.totalDonations;
        document.querySelector('.stat-number:nth-child(2)').textContent = stats.activeDonations;
        document.querySelector('.stat-number:nth-child(3)').textContent = stats.ngosHelped;
        document.querySelector('.stat-number:nth-child(4)').textContent = stats.mealsProvided;
    }

    function populateDonationsTable(donations) {
        const tbody = document.querySelector('.donations-table tbody');
        tbody.innerHTML = donations.map(donation => `
            <tr data-id="${donation.id}">
                <td>${donation.foodType}</td>
                <td>${donation.quantity} meals</td>
                <td>${donation.pickupUntil}</td>
                <td><span class="status ${donation.status.toLowerCase()}">${donation.status}</span></td>
                <td>
                    <button class="btn btn-small">Edit</button>
                    <button class="btn btn-small btn-danger">Cancel</button>
                </td>
            </tr>
        `).join('');
    }

    async function refreshDashboardStats() {
        try {
            const response = await fetch(`${API_ENDPOINTS.donations}/stats`);
            if (!response.ok) throw new Error('Failed to refresh stats');

            const stats = await response.json();
            updateDashboardStats(stats);

        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    async function refreshDonationsTable() {
        try {
            const response = await fetch(`${API_ENDPOINTS.donations}/active`);
            if (!response.ok) throw new Error('Failed to refresh donations');

            const donations = await response.json();
            populateDonationsTable(donations);

        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}); 