function initializeData() {
  if (!localStorage.getItem('socialAppUsers')) {
    const defaultUsers = [
      { id: 1, username: 'alice', password: '123456', name: 'Alice Johnson', bio: 'Designer • Coffee lover', avatar: 'https://i.pravatar.cc/150?img=47' },
      { id: 2, username: 'bob', password: '123456', name: 'Bob Smith', bio: 'Developer • Building cool stuff', avatar: 'https://i.pravatar.cc/150?img=12' }
    ];
    localStorage.setItem('socialAppUsers', JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem('socialAppPosts')) {
    const defaultPosts = [
      { id: 1, author: 'alice', content: 'Enjoying a peaceful morning and a fresh coffee!', likes: 12, comments: ['Love this!', 'Great vibe!'] },
      { id: 2, author: 'bob', content: 'Just shipped a new feature for the team.', likes: 8, comments: ['Amazing work!'] }
    ];
    localStorage.setItem('socialAppPosts', JSON.stringify(defaultPosts));
  }

  if (!localStorage.getItem('socialAppFollows')) {
    localStorage.setItem('socialAppFollows', JSON.stringify({ alice: ['bob'], bob: ['alice'] }));
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem('socialAppUsers') || '[]');
}

document.addEventListener('DOMContentLoaded', () => {
  initializeData();

  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const message = document.getElementById('message');

    const user = getUsers().find((entry) => entry.username === username && entry.password === password);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      window.location.href = 'home.html';
    } else {
      message.textContent = 'Invalid credentials';
    }
  });
});
