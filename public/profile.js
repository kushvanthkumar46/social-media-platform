function initializeData() {
  if (!localStorage.getItem('socialAppFollows')) {
    localStorage.setItem('socialAppFollows', JSON.stringify({ alice: ['bob'], bob: ['alice'] }));
  }
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function getPosts() {
  return JSON.parse(localStorage.getItem('socialAppPosts') || '[]');
}

function getFollows() {
  return JSON.parse(localStorage.getItem('socialAppFollows') || '{}');
}

function saveFollows(follows) {
  localStorage.setItem('socialAppFollows', JSON.stringify(follows));
}

function loadProfile() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('profileAvatar').src = user.avatar;
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileBio').textContent = user.bio;

  const follows = getFollows();
  const followingList = follows[user.username] || [];
  document.getElementById('followCount').textContent = `Following ${followingList.length}`;

  const profilePosts = getPosts().filter((post) => post.author === user.username);
  const container = document.getElementById('profilePosts');
  container.innerHTML = '';

  profilePosts.forEach((post) => {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `<strong>${post.author}</strong><p>${post.content}</p><p>Likes: ${post.likes}</p>`;
    container.appendChild(div);
  });
}

function followUser() {
  const user = getCurrentUser();
  if (!user) return;

  const follows = getFollows();
  const followingList = follows[user.username] || [];
  if (!followingList.includes('bob')) {
    followingList.push('bob');
  }
  follows[user.username] = followingList;
  saveFollows(follows);
  loadProfile();
}

document.addEventListener('DOMContentLoaded', () => {
  initializeData();
  document.getElementById('followBtn').addEventListener('click', followUser);
  loadProfile();
});
