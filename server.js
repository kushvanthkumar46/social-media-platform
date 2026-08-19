const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

let users = [
  { id: 1, username: 'alice', password: '123456', name: 'Alice Johnson', bio: 'Designer • Coffee lover', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 2, username: 'bob', password: '123456', name: 'Bob Smith', bio: 'Developer • Building cool stuff', avatar: 'https://i.pravatar.cc/150?img=12' }
];

let posts = [
  { id: 1, author: 'alice', content: 'Enjoying a peaceful morning and a fresh coffee!', likes: 12, comments: ['Love this!', 'Great vibe!'] },
  { id: 2, author: 'bob', content: 'Just shipped a new feature for the team.', likes: 8, comments: ['Amazing work!'] }
];

let follows = {
  alice: ['bob'],
  bob: ['alice']
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.png': return 'image/png';
    case '.jpg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    default: return 'text/plain; charset=utf-8';
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function parseBody(body, contentType) {
  if (!body) return {};
  if (contentType && contentType.includes('application/json')) {
    try { return JSON.parse(body); } catch { return {}; }
  }
  if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(body);
    const result = {};
    params.forEach((value, key) => { result[key] = value; });
    return result;
  }
  return {};
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'POST' && pathname === '/login') {
    const body = await readBody(req);
    const data = parseBody(body, req.headers['content-type']);
    const username = String(data.username || '').trim().toLowerCase();
    const password = String(data.password || '').trim();
    const user = users.find(u => u.username.toLowerCase() === username && String(u.password) === password);

    if (!user) {
      return sendJson(res, 401, { success: false, message: 'Invalid credentials' });
    }

    return sendJson(res, 200, { success: true, user });
  }

  if (req.method === 'GET' && pathname === '/api/users') {
    return sendJson(res, 200, users);
  }

  if (req.method === 'GET' && pathname === '/api/posts') {
    return sendJson(res, 200, posts);
  }

  if (req.method === 'POST' && pathname === '/api/posts') {
    const body = await readBody(req);
    const data = parseBody(body, req.headers['content-type']);
    const { author, content } = data;

    if (!author || !content) {
      return sendJson(res, 400, { success: false, message: 'Missing data' });
    }

    const newPost = { id: Date.now(), author, content, likes: 0, comments: [] };
    posts.unshift(newPost);
    return sendJson(res, 200, { success: true, post: newPost });
  }

  if (req.method === 'POST' && pathname.startsWith('/api/posts/') && pathname.endsWith('/like')) {
    const id = Number(pathname.split('/')[3]);
    const post = posts.find(p => p.id === id);
    if (!post) return sendJson(res, 404, { success: false, message: 'Post not found' });
    post.likes += 1;
    return sendJson(res, 200, { success: true, likes: post.likes });
  }

  if (req.method === 'POST' && pathname.startsWith('/api/posts/') && pathname.endsWith('/comment')) {
    const id = Number(pathname.split('/')[3]);
    const post = posts.find(p => p.id === id);
    if (!post) return sendJson(res, 404, { success: false, message: 'Post not found' });

    const body = await readBody(req);
    const data = parseBody(body, req.headers['content-type']);
    if (!data.text) return sendJson(res, 400, { success: false, message: 'Comment missing' });

    post.comments.push(data.text);
    return sendJson(res, 200, { success: true, comments: post.comments });
  }

  if (req.method === 'POST' && pathname === '/api/follow') {
    const body = await readBody(req);
    const data = parseBody(body, req.headers['content-type']);
    const { follower, following } = data;
    if (!follows[follower]) follows[follower] = [];
    if (!follows[follower].includes(following)) follows[follower].push(following);
    return sendJson(res, 200, { success: true, follows: follows[follower] });
  }

  if (req.method === 'GET' && pathname.startsWith('/api/follows/')) {
    const username = pathname.split('/').pop();
    return sendJson(res, 200, { follows: follows[username] || [] });
  }

  const normalizedPath = pathname === '/' ? '/login.html' : pathname;
  const filePath = path.join(publicDir, normalizedPath);

  if (filePath.startsWith(publicDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return serveFile(res, filePath);
  }

  if (pathname === '/' || pathname === '/home' || pathname === '/profile') {
    const pageFile = pathname === '/home' ? 'home.html' : pathname === '/profile' ? 'profile.html' : 'login.html';
    return serveFile(res, path.join(publicDir, pageFile));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
