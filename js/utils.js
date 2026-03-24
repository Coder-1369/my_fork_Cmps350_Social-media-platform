function generateId(prefix){
    return prefix+"_"+Math.random().toString(36).slice(2, 9);
}

const AVATAR_COLORS = [
    "#d4845a", "#c27a4e", "#b08060", "#a87050",
    "#c99070", "#b5785a", "#d09878", "#a86848"
];

function getAvatarColor(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString(
        "en-GB",{
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
        }
    )}

 function getInitials(username) {
    return username.slice(0, 2).toUpperCase();
}