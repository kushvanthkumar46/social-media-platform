function initializeData() {
  if (!localStorage.getItem('socialAppPosts')) {
    localStorage.setItem('socialAppPosts', JSON.stringify([
      { id: 1, author: 'alice', content: 'Enjoying a peaceful morning and a fresh coffee!', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop', likes: 12, comments: ['Love this!', 'Great vibe!'] },
      { id: 2, author: 'bob', content: 'Just shipped a new feature for the team.', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop', likes: 8, comments: ['Amazing work!'] }
    ]));
  }
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function getPosts() {
  return JSON.parse(localStorage.getItem('socialAppPosts') || '[]');
}

function savePosts(posts) {
  localStorage.setItem('socialAppPosts', JSON.stringify(posts));
}

function loadPosts() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const posts = getPosts().slice().reverse();
  const feed = document.getElementById('feed');
  feed.innerHTML = '';

  posts.forEach((post) => {
    const card = document.createElement('div');
    card.className = 'post-card';
    const imageHtml = post.image ? `<div class="post-media"><img class="post-image" src="${post.image}" alt="post image" loading="lazy"/></div>` : '';
    card.innerHTML = `
      <div class="post-meta">
        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=ddd&color=333&rounded=true" alt="avatar" />
        <div>
          <div class="post-author">${post.author}</div>
          <div class="post-time muted">just now</div>
        </div>
      </div>
      ${imageHtml}
      <div class="post-body">${post.content || ''}</div>
      <div class="post-actions">
        <button onclick="likePost(${post.id})">❤️ ${post.likes}</button>
        <button onclick="commentOnPost(${post.id})">💬 ${post.comments.length}</button>
      </div>
      <div class="post-comments">${post.comments.map((c) => `<div class="comment">${c}</div>`).join('')}</div>
    `;
    feed.appendChild(card);
  });
}

function createPost() {
  const user = getCurrentUser();
  const content = document.getElementById('postText').value.trim();
  const image = document.getElementById('postImage').value.trim();
  if (!content || !user) return;

  const posts = getPosts();
  posts.unshift({ id: Date.now(), author: user.username, content, image: image || null, likes: 0, comments: [] });
  savePosts(posts);
  document.getElementById('postText').value = '';
  document.getElementById('postImage').value = '';
  loadPosts();
}

function likePost(id) {
  const posts = getPosts();
  const post = posts.find((entry) => entry.id === id);
  if (post) {
    post.likes += 1;
    savePosts(posts);
    loadPosts();
  }
}

function commentOnPost(id) {
  const comment = prompt('Enter your comment');
  if (!comment) return;

  const posts = getPosts();
  const post = posts.find((entry) => entry.id === id);
  if (post) {
    post.comments.push(comment);
    savePosts(posts);
    loadPosts();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeData();
  document.getElementById('createPostBtn').addEventListener('click', createPost);
  loadPosts();
});

window.likePost = likePost;
window.commentOnPost = commentOnPost;
