/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 3
* Due: 6/13/24, 11:59 PM EDT
*/

export const formatTimestamp = (timestamp) => {
    // Calculates how much time has passed since post creation
    const now = new Date();
    const differenceInSeconds = Math.floor((now - timestamp) / 1000);

    // Formats time difference as a string
    if (differenceInSeconds < 60) {
        return 'Posted now';
    } else if (differenceInSeconds < 3600) { // 60 minutes
        const minutes = Math.floor(differenceInSeconds / 60);
        return `Posted ${minutes}m ago`;
    } else if (differenceInSeconds < 86400) { // 24 hours
        const hours = Math.floor(differenceInSeconds / 3600);
        const remainingMinutes = Math.floor((differenceInSeconds % 3600) / 60);
        const hoursDecimal = hours + (remainingMinutes / 60);
        return `Posted ${hoursDecimal.toFixed(1)}h ago`;
    } else if (differenceInSeconds < 86400000) { // 1000 days
        const days = Math.floor(differenceInSeconds / 86400);
        const remainingHours = Math.floor((differenceInSeconds % 86400) / 3600);
        const daysDecimal = days + (remainingHours / 24);
        return `Posted ${daysDecimal.toFixed(1)}d ago`;
    } else {
        return `Posted a long time ago`;
    }
};