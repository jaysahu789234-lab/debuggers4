// ==========================
// 🔐 AUTH
// ==========================

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    const user = getUsers().find(u =>
        u.username === username && u.password === password
    );

    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = "home.html";
    } else {
        message.style.color = "red";
        message.textContent = "Invalid credentials ❌";
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// ==========================
// 🧭 SPA NAVIGATION
// ==========================

function showHome() {
    document.getElementById("profilePage").style.display = "none";
    document.getElementById("explorePage").style.display = "none";
    document.querySelector(".layout").style.display = "grid";
}

function goHome() {
    showHome();
    render();
}

function openProfile() {
    document.querySelector(".layout").style.display = "none";
    document.getElementById("explorePage").style.display = "none";
    document.getElementById("profilePage").style.display = "block";

    loadProfile();
}

function openExplore() {
    document.querySelector(".layout").style.display = "none";
    document.getElementById("profilePage").style.display = "none";
    document.getElementById("explorePage").style.display = "block";

    loadExplore();
}

// ==========================
// 📝 POSTS
// ==========================

function getPosts() {
    return JSON.parse(localStorage.getItem("posts")) || [];
}

function savePosts(posts) {
    localStorage.setItem("posts", JSON.stringify(posts));
}

function addPost() {
    const title = document.getElementById("modalTitle").value.trim();
    const description = document.getElementById("modalDescription").value.trim();
    const category = document.getElementById("modalCategory").value;
    const file = document.getElementById("mediaInput").files[0];

    if (!title || !category) return alert("Title & category required");

    const user = getCurrentUser()?.username;
    let posts = getPosts();

    const create = (media = null, type = null) => {
        posts.push({
            id: Date.now(),
            title,
            description,
            category,
            user,
            date: new Date().toLocaleString(),
            reactions: { likes: [], dislikes: [] },
            comments: [],
            media,
            mediaType: type
        });

        savePosts(posts);
        clearForm();
        closeModal();
        render();
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const type = file.type.startsWith("video") ? "video" : "image";
            create(e.target.result, type);
        };
        reader.readAsDataURL(file);
    } else {
        create();
    }
}

// ==========================
// 👍 LIKE
// ==========================

function likePost(id) {
    const user = getCurrentUser()?.username;
    let posts = getPosts();

    posts = posts.map(p => {
        if (!p.reactions) p.reactions = { likes: [], dislikes: [] };

        if (p.id === id) {
            if (p.reactions.likes.includes(user)) {
                p.reactions.likes = p.reactions.likes.filter(u => u !== user);
            } else {
                p.reactions.likes.push(user);
                p.reactions.dislikes = p.reactions.dislikes.filter(u => u !== user);
            }
        }
        return p;
    });

    savePosts(posts);
    render();
}

// ==========================
// 💬 COMMENTS
// ==========================

function addComment(id) {
    const input = document.getElementById(`c-${id}`);
    if (!input.value.trim()) return;

    let posts = getPosts();

    posts = posts.map(p => {
        if (p.id === id) {
            if (!p.comments) p.comments = [];
            p.comments.push(input.value);
        }
        return p;
    });

    savePosts(posts);
    render();
}

// ==========================
// 🎨 RENDER HOME FEED
// ==========================

function render(list = null) {
    const feed = document.getElementById("feed");
    if (!feed) return;

    const posts = (list || getPosts()).slice().reverse();

    feed.innerHTML = "";

    posts.forEach(p => {
        const div = document.createElement("div");
        div.className = "post";

        let media = "";

        if (p.media) {
            media = p.mediaType === "video"
                ? `<video src="${p.media}" controls style="width:100%;border-radius:12px;"></video>`
                : `<img src="${p.media}" style="width:100%;border-radius:12px;">`;
        }

        div.innerHTML = `
            <h3>${p.title}</h3>
            <span>${p.category}</span>
            <small>👤 ${p.user} | ${p.date}</small>
            <p>${p.description}</p>
            ${media}

            <button onclick="likePost(${p.id})">👍 ${p.reactions?.likes?.length || 0}</button>
            <button onclick="addComment(${p.id})">💬 Comment</button>

            <input id="c-${p.id}" placeholder="Write comment...">
        `;

        feed.appendChild(div);
    });
}

// ==========================
// 🧭 EXPLORE FIX
// ==========================

function loadExplore() {
    const feed = document.getElementById("videoFeed");
    const posts = getPosts();

    const videos = posts.filter(p => p.mediaType === "video");

    if (videos.length === 0) {
        feed.innerHTML = `<p style="color:white;padding:20px;">No videos yet 🔥</p>`;
        return;
    }

    feed.innerHTML = videos.map(v => `
        <div class="video-card">
            <video src="${v.media}" autoplay muted loop controls></video>
        </div>
    `).join("");
}

// ==========================
// 🪟 MODAL
// ==========================

function openModal() {
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function clearForm() {
    document.getElementById("modalTitle").value = "";
    document.getElementById("modalDescription").value = "";
    document.getElementById("modalCategory").value = "";
    document.getElementById("mediaInput").value = "";
}

// ==========================
// 👤 PROFILE
// ==========================

function loadProfile() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById("profileUsername").innerText = user.username;
    document.getElementById("profileBio").innerText = user.bio || "No bio yet";

    const posts = getPosts().filter(p => p.user === user.username);
    document.getElementById("myPosts").innerHTML =
        posts.map(p => `<p>${p.title}</p>`).join("");
}

// ==========================
// INIT
// ==========================

window.onload = function () {
    if (document.getElementById("feed")) {
        render();
    }
};