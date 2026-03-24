function getCurrentUser() {
    const session = getSession();
    if (!session) {
        window.location.href = "index.html";
        return null;
    }
    return getUserById(session.userId);
}

function isFollowing(currentUser, targetId) {
    return currentUser.following.includes(targetId);
}

function toggleFollow(currentUserId, targetId) {
    const users = getUsers();
    const currentUser = users.find(u => u.id === currentUserId);
    if (!currentUser) return;

    const idx = currentUser.following.indexOf(targetId);
    if (idx === -1) {
        currentUser.following.push(targetId);
    } else {
        currentUser.following.splice(idx, 1);
    }

    saveUsers(users);
    renderProfiles();
}

function createProfileCard(user, currentUser) {
    const card = document.createElement("div");
    card.className = "profile-card";

    const initials = getInitials(user.username);
    const avatarColor = getAvatarColor(user.id);
    const following = isFollowing(currentUser, user.id);

    card.innerHTML =
        '<div class="profile-avatar" style="background-color: ' + avatarColor + '">' +
            initials +
        '</div>' +
        '<h3 class="profile-name">' + user.username + '</h3>' +
        '<p class="profile-bio">' + user.bio + '</p>' +
        '<button class="follow-btn ' + (following ? 'following' : 'follow') + '" data-user-id="' + user.id + '">' +
            (following ? 'Following' : 'Follow') +
        '</button>';

    const btn = card.querySelector(".follow-btn");
    btn.addEventListener("click", function () {
        toggleFollow(currentUser.id, user.id);
    });

    return card;
}

function renderProfiles() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const grid = document.getElementById("profiles-grid");
    grid.innerHTML = "";

    const allUsers = getUsers();
    const otherUsers = allUsers.filter(function (u) {
        return u.id !== currentUser.id;
    });

    otherUsers.forEach(function (user) {
        grid.appendChild(createProfileCard(user, currentUser));
    });
}

function handleLogout() {
    clearSession();
    window.location.href = "index.html";
}

function initExplore() {
    const session = getSession();
    if (!session) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("logout-btn").addEventListener("click", function (e) {
        e.preventDefault();
        handleLogout();
    });

    renderProfiles();
}

document.addEventListener("DOMContentLoaded", initExplore);
