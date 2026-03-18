/**
 * Reusable utility for time display.
 * 
 * If duration < 24 hours: Format as HH:mm:ss
 * If duration ≥ 24 hours: Format as "X Days, Y Hours, Z Minutes, W Seconds"
 * 
 * @param {number} seconds - The duration in seconds.
 * @returns {string} The formatted duration string.
 */
export const formatDuration = (seconds) => {
    if (seconds < 0) return "00:00:00";

    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days >= 1) {
        const parts = [];
        if (days === 1) parts.push(`${days} Day`);
        else parts.push(`${days} Days`);

        if (hours === 1) parts.push(`${hours} Hour`);
        else if (hours > 1) parts.push(`${hours} Hours`);

        if (minutes === 1) parts.push(`${minutes} Minute`);
        else if (minutes > 1) parts.push(`${minutes} Minutes`);

        if (secs === 1) parts.push(`${secs} Second`);
        else if (secs > 0) parts.push(`${secs} Seconds`);

        return parts.join(", ");
    }

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
};
