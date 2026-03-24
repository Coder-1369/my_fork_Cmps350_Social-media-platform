
function getFollowersCount(userId) {
    return getUsers().filter(function (u) {
        return u.following.includes(userId);
    }).length;
}

function createProfilePostCard(post) {
    const card = document.createElement("div");
    card.className = "post-card";
    card.innerHTML =
        '<div class="post-meta">' +
            '<span>' + formatDate(post.createdAt) + '</span>' +
        '</div>' +
        '<div class="post-content">' +
            '<p>' + post.content + '</p>' +
            '<div class="post-actions">' +
                '<span>♥ ' + post.likes.length + '</span>' +
                '<span>✦ ' + post.comments.length + '</span>' +
            '</div>' +
        '</div>';
    return card;
}

function renderProfile(profileUser, currentUser) {
    // Avatar
    const avatarEl = document.getElementById("profile-avatar");
    avatarEl.textContent = getInitials(profileUser.username);
    avatarEl.style.backgroundColor = getAvatarColor(profileUser.id);
    avatarEl.style.color = "#ffffff";

    // Name and bio
    document.getElementById("profile-username").textContent = profileUser.username;
    document.getElementById("profile-bio").textContent = profileUser.bio || "No bio yet.";

    // Stats
    const userPosts = getPosts().filter(function (p) { return p.authorId === profileUser.id; });
    document.getElementById("posts-count").textContent = userPosts.length;
    document.getElementById("following-count").textContent = profileUser.following.length;
    document.getElementById("followers-count").textContent = getFollowersCount(profileUser.id);

    // Own profile vs other profile
    const isOwnProfile = profileUser.id === currentUser.id;
    const editBtn = document.getElementById("edit-profile-btn");
    const followBtn = document.getElementById("follow-btn");

    if (isOwnProfile) {
        followBtn.classList.add("hidden");
        editBtn.classList.remove("hidden");
    } else {
        editBtn.classList.add("hidden");
        followBtn.classList.remove("hidden");
        const following = currentUser.following.includes(profileUser.id);
        followBtn.textContent = following ? "Unfollow" : "Follow";
        followBtn.classList.remove("btn-primary", "btn-outline");
        followBtn.classList.add(following ? "btn-outline" : "btn-primary");
    }

    // Posts list
    const container = document.getElementById("profile-posts-container");
    container.innerHTML = "";
    if (userPosts.length === 0) {
        container.innerHTML = "<p style='color: var(--color-muted); padding: 1rem 5%;'>No posts yet.</p>";
    } else {
        userPosts
            .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); })
            .forEach(function (post) {
                container.appendChild(createProfilePostCard(post));
            });
    }
}

function initProfile() {
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

    const params = new URLSearchParams(window.location.search);
    const profileId = params.get("id");
    const profileUserId = profileId ? profileId : currentUser.id;
    const profileUser = getUserById(profileUserId);

    if (!profileUser) {
        window.location.href = "feed.html";
        return;
    }

    renderProfile(profileUser, currentUser);

    // Logout
    document.getElementById("logout-btn").addEventListener("click", function (e) {
        e.preventDefault();
        clearSession();
        window.location.href = "index.html";
    });

    // Follow / Unfollow
    const followBtn = document.getElementById("follow-btn");
    followBtn.addEventListener("click", function () {
        const users = getUsers();
        const me = users.find(function (u) { return u.id === currentUser.id; });
        if (!me) return;
        const idx = me.following.indexOf(profileUser.id);
        if (idx === -1) {
            me.following.push(profileUser.id);
        } else {
            me.following.splice(idx, 1);
        }
        saveUsers(users);
        const updatedCurrentUser = getUserById(currentUser.id);
        renderProfile(profileUser, updatedCurrentUser);
    });

    // Edit profile modal (own profile only)
    if (profileUser.id === currentUser.id) {
        const editBtn = document.getElementById("edit-profile-btn");
        const modal = document.getElementById("edit-modal");
        const closeModalBtn = document.getElementById("close-edit-modal");
        const saveBtn = document.getElementById("save-profile-btn");

        editBtn.addEventListener("click", function () {
            const latestUser = getUserById(currentUser.id);
            document.getElementById("edit-username").value = latestUser ? latestUser.username : "";
            document.getElementById("edit-bio").value = latestUser ? (latestUser.bio || "") : "";
            modal.classList.remove("hidden");
        });

        closeModalBtn.addEventListener("click", function () {
            modal.classList.add("hidden");
        });

        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                modal.classList.add("hidden");
            }
        });

        saveBtn.addEventListener("click", function () {
            const newUsername = document.getElementById("edit-username").value.trim();
            const newBio = document.getElementById("edit-bio").value.trim();
            if (!newUsername) return;

            const users = getUsers();
            const idx = users.findIndex(function (u) { return u.id === currentUser.id; });
            if (idx !== -1) {
                users[idx].username = newUsername;
                users[idx].bio = newBio;
                saveUsers(users);
            }

            modal.classList.add("hidden");
            const updatedUser = getUserById(currentUser.id);
            if (updatedUser) renderProfile(updatedUser, updatedUser);
        });
    }
}

document.addEventListener("DOMContentLoaded", initProfile);
