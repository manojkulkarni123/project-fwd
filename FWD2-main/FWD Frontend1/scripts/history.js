// History management functions
function getHistoryDonations() {
    return JSON.parse(localStorage.getItem('historyDonations') || '[]');
}

function storeHistoryDonations(donations) {
    localStorage.setItem('historyDonations', JSON.stringify(donations));
}

function addToHistory(donation) {
    const history = getHistoryDonations();
    history.unshift({
        ...donation,
        addedToHistoryAt: new Date().toISOString()
    });
    storeHistoryDonations(history);
}

function getHistoryByUser(userId) {
    const history = getHistoryDonations();
    return history.filter(donation => 
        donation.restaurantId === userId || donation.claimedBy === userId
    );
}

// Export functions
window.getHistoryDonations = getHistoryDonations;
window.storeHistoryDonations = storeHistoryDonations;
window.addToHistory = addToHistory;
window.getHistoryByUser = getHistoryByUser; 