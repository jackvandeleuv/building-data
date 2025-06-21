export function daysAgoLabel(unixDate) {
    const delta = Date.now() - unixDate;
    const daysAgo = Math.floor(delta / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) {
        return 'Recent'
    } else if (daysAgo === 1) {
        return 'Yesterday'
    } else if (daysAgo < 365) {
        return `${daysAgo} days ago`
    } else if (daysAgo < 365 * 2) {
        return `1 year ago`
    } else {
        return `${Math.floor(daysAgo / 365)} years ago`
    }
}