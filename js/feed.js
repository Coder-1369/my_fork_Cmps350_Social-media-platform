function renderCommentsList(comments) {
    if (!comments || comments.length === 0) return "";
    return comments.map(function (c) {
        const author = getUserById(c.authorId);
        const name = author ? author.username : "Unknown";
        return (
            '<div class="comment-item">' +
                '<span class="comment-author">' + name + ':</span> ' +
                '<span class="comment-text">' + c.content + '</span>' +
            '</div>'
        );
    }).join("");
}

function createPostCard(post, author, currentUserId) {
    const card = document.createElement("div");
    card.className = "feed-post-card";

    const initials = getInitials(author.username);
    const avatarColor = getAvatarColor(author.id);
    const isLiked = post.likes.includes(currentUserId);
    const likesCount = post.likes.length;
    const commentsCount = post.comments.length;

    card.innerHTML =
        '<div class="feed-post-header">' +
            '<div class="post-author-avatar" style="background-color: ' + avatarColor + '">' + initials + '</div>' +
            '<div class="post-author-info">' +
                '<a href="profile.html?id=' + author.id + '" class="post-author-name">' + author.username + '</a>' +
                '<span class="post-date">' + formatDate(post.createdAt) + '</span>' +
            '</div>' +
        '</div>' +
        '<div class="feed-post-body">' +
            '<p>' + post.content + '</p>' +
        '</div>' +
        '<div class="feed-post-actions">' +
            '<button class="action-btn like-btn ' + (isLiked ? 'liked' : '') + '" data-post-id="' + post.id + '">' +
                '<svg viewBox="0 0 24 24" fill="' + (isLiked ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' +
                '</svg>' +
                '<span>' + likesCount + '</span>' +
            '</button>' +
            '<button class="action-btn comment-toggle-btn" data-post-id="' + post.id + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
                '</svg>' +
                '<span>' + commentsCount + '</span>' +
            '</button>' +
        '</div>' +
        '<div class="comments-section hidden" id="comments-' + post.id + '">' +
            '<div class="comments-list" id="comments-list-' + post.id + '">' +
                renderCommentsList(post.comments) +
            '</div>' +
            '<div class="add-comment">' +
                '<input type="text" id="comment-input-' + post.id + '" placeholder="Write a comment…">' +
                '<button class="submit-comment-btn btn-post" data-post-id="' + post.id + '">Send</button>' +
            '</div>' +
        '</div>';

    card.querySelector(".like-btn").addEventListener("click", function () {
        handleLike(post.id, currentUserId);
    });

    card.querySelector(".comment-toggle-btn").addEventListener("click", function () {
        var section = document.getElementById("comments-" + post.id);
        section.classList.toggle("hidden");
    });

    card.querySelector(".submit-comment-btn").addEventListener("click", function () {
        handleComment(post.id, currentUserId, card);
    });

    card.querySelector("#comment-input-" + post.id).addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            handleComment(post.id, currentUserId, card);
        }
    });

    return card;
}

function handleLike(postId, currentUserId) {
    var posts = getPosts();
    var post = posts.find(function (p) { return p.id === postId; });
    if (!post) return;

    var idx = post.likes.indexOf(currentUserId);
    if (idx === -1) {
        post.likes.push(currentUserId);
    } else {
        post.likes.splice(idx, 1);
    }
    savePosts(posts);
    renderFeed();
}

function handleComment(postId, currentUserId, card) {
    var input = card.querySelector("#comment-input-" + postId);
    var content = input.value.trim();
    if (!content) return;

    var posts = getPosts();
    var post = posts.find(function (p) { return p.id === postId; });
    if (!post) return;

    post.comments.push({
        id: generateId("c"),
        authorId: currentUserId,
        content: content,
        createdAt: new Date().toISOString()
    });
    savePosts(posts);
    renderFeed();

    // Re-open the comments section after re-render
    var section = document.getElementById("comments-" + postId);
    if (section) section.classList.remove("hidden");
}

function handleCreatePost(currentUserId) {
    var textarea = document.getElementById("post-content");
    var content = textarea.value.trim();
    if (!content) return;

    var posts = getPosts();
    posts.unshift({
        id: generateId("p"),
        authorId: currentUserId,
        content: content,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
    });
    savePosts(posts);
    textarea.value = "";
    renderFeed();
}

function renderFeed() {
    var session = getSession();
    if (!session) {
        window.location.href = "index.html";
        return;
    }

    var currentUser = getUserById(session.userId);
    if (!currentUser) return;

    var avatarEl = document.getElementById("create-post-avatar");
    avatarEl.textContent = getInitials(currentUser.username);
    avatarEl.style.backgroundColor = getAvatarColor(currentUser.id);

    var feed = document.getElementById("posts-feed");
    feed.innerHTML = "";

    var allPosts = getPosts();
    allPosts.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    if (allPosts.length === 0) {
        feed.innerHTML = '<p class="empty-feed">No posts yet. Be the first to share something!</p>';
        return;
    }

    allPosts.forEach(function (post) {
        var author = getUserById(post.authorId);
        if (!author) return;
        feed.appendChild(createPostCard(post, author, currentUser.id));
    });
}

function initFeed() {
    var session = getSession();
    if (!session) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("logout-btn").addEventListener("click", function (e) {
        e.preventDefault();
        clearSession();
        window.location.href = "index.html";
    });

    document.getElementById("submit-post-btn").addEventListener("click", function () {
        var s = getSession();
        if (s) handleCreatePost(s.userId);
    });

    document.getElementById("post-content").addEventListener("keydown", function (e) {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            var s = getSession();
            if (s) handleCreatePost(s.userId);
        }
    });

    renderFeed();
}

document.addEventListener("DOMContentLoaded", initFeed);
