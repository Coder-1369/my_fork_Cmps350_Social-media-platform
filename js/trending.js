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

function getFollowerCount(userId, allUsers) {
    return allUsers.filter(function (u) {
        return u.following.includes(userId);
    }).length;
}

function isFollowing(currentUser, targetId) {
    return currentUser.following.includes(targetId);
}

function toggleFollow(currentUserId, targetId, onDone) {
    const users = getUsers();
    const currentUser = users.find(function (u) { return u.id === currentUserId; });
    if (!currentUser) return;

    const idx = currentUser.following.indexOf(targetId);
    if (idx === -1) {
        currentUser.following.push(targetId);
    } else {
        currentUser.following.splice(idx, 1);
    }

    saveUsers(users);
    if (onDone) onDone();
}

function createRankBadge(rank) {
    const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
    const badge = document.createElement("div");
    badge.className = "rank-badge" + (rank <= 3 ? " rank-" + rank : "");
    badge.textContent = medals[rank] || rank;
    return badge;
}

function createTrendingRow(user, rank, followerCount, currentUser) {
    const row = document.createElement("div");
    row.className = "trending-row" + (rank <= 3 ? " rank-" + rank : "");

    const initials = getInitials(user.username);
    const avatarColor = getAvatarColor(user.id);
    const isSelf = user.id === currentUser.id;
    const following = isFollowing(currentUser, user.id);

    row.appendChild(createRankBadge(rank));

    const avatar = document.createElement("div");
    avatar.className = "trending-avatar";
    avatar.style.backgroundColor = avatarColor;
    avatar.textContent = initials;
    row.appendChild(avatar);

    const info = document.createElement("div");
    info.className = "trending-info";
    info.innerHTML =
        '<h3 class="trending-name">' + user.username + '</h3>' +
        '<p class="trending-bio">' + user.bio + '</p>';
    row.appendChild(info);

    const countEl = document.createElement("div");
    countEl.className = "follower-count";
    countEl.innerHTML =
        '<span class="follower-number">' + followerCount + '</span>' +
        '<span class="follower-label">Followers</span>';
    row.appendChild(countEl);

    const btn = document.createElement("button");
    btn.className = "follow-btn " + (isSelf ? "hidden" : (following ? "following" : "follow"));
    btn.dataset.userId = user.id;
    btn.textContent = isSelf ? "" : (following ? "Following" : "Follow");

    if (!isSelf) {
        btn.addEventListener("click", function () {
            toggleFollow(currentUser.id, user.id, function () {
                renderTrending();
            });
        });
    }
    row.appendChild(btn);

    return row;
}

function renderTrending() {
    const session = getSession();
    if (!session) {
        window.location.href = "index.html";
        return;
    }

    const currentUser = getUserById(session.userId);
    if (!currentUser) {
        window.location.href = "index.html";
        return;
    }

    const allUsers = getUsers();

    const ranked = allUsers
        .map(function (u) {
            return { user: u, followers: getFollowerCount(u.id, allUsers) };
        })
        .sort(function (a, b) {
            return b.followers - a.followers || a.user.username.localeCompare(b.user.username);
        });

    const list = document.getElementById("trending-list");
    list.innerHTML = "";

    if (ranked.length === 0) {
        const empty = document.createElement("p");
        empty.className = "trending-empty";
        empty.textContent = "No users found.";
        list.appendChild(empty);
        return;
    }

    ranked.forEach(function (entry, index) {
        list.appendChild(
            createTrendingRow(entry.user, index + 1, entry.followers, currentUser)
        );
    });
}

function handleLogout() {
    clearSession();
    window.location.href = "index.html";
}

function initTrending() {
    const session = getSession();
    if (!session) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("logout-btn").addEventListener("click", function (e) {
        e.preventDefault();
        handleLogout();
    });

    renderTrending();
}

document.addEventListener("DOMContentLoaded", initTrending);
