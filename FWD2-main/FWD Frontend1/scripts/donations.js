// Donations management functions
function getStoredDonations() {
    return JSON.parse(localStorage.getItem('donations') || '[]');
}

function storeDonations(donations) {
    localStorage.setItem('donations', JSON.stringify(donations));
}

function getClaimedDonations() {
    return JSON.parse(localStorage.getItem('claimedDonations') || '[]');
}

function storeClaimedDonations(donations) {
    localStorage.setItem('claimedDonations', JSON.stringify(donations));
}

function addDonation(donation) {
    const donations = getStoredDonations();
    donations.unshift({
        ...donation,
        id: Date.now().toString(),
        status: 'AVAILABLE',
        createdAt: new Date().toISOString()
    });
    storeDonations(donations);
    return donations[0];
}

function updateDonation(donationId, updates) {
    const donations = getStoredDonations();
    const index = donations.findIndex(d => d.id === donationId);
    if (index !== -1) {
        donations[index] = { ...donations[index], ...updates };
        storeDonations(donations);
        return donations[index];
    }
    return null;
}

function claimDonation(donationId, ngoId) {
    const donation = updateDonation(donationId, {
        status: 'CLAIMED',
        claimedBy: ngoId,
        claimedTime: new Date().toISOString()
    });

    if (donation) {
        const claimedDonations = getClaimedDonations();
        claimedDonations.unshift(donation);
        storeClaimedDonations(claimedDonations);
    }

    return donation;
}

function getDonationsByStatus(status) {
    const donations = getStoredDonations();
    return donations.filter(d => d.status === status);
}

function getDonationsByUser(userId, type = 'restaurant') {
    const donations = getStoredDonations();
    return donations.filter(d => 
        type === 'restaurant' ? d.restaurantId === userId : d.claimedBy === userId
    );
}

// Export functions
window.getStoredDonations = getStoredDonations;
window.storeDonations = storeDonations;
window.getClaimedDonations = getClaimedDonations;
window.storeClaimedDonations = storeClaimedDonations;
window.addDonation = addDonation;
window.updateDonation = updateDonation;
window.claimDonation = claimDonation;
window.getDonationsByStatus = getDonationsByStatus;
window.getDonationsByUser = getDonationsByUser; 