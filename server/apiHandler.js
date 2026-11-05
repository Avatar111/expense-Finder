import { registerUser, loginUser, syncUserTransactions, getUserTransactions } from './db.js';

export async function handleApiRequest(req, res) {
  // Extract path and query
  const parsedUrl = new URL(req.url, 'http://localhost');
  const pathname = parsedUrl.pathname;
  const method = req.method;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  const readBody = () => {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          reject(new Error('Invalid JSON in request body'));
        }
      });
      req.on('error', reject);
    });
  };

  try {
    if (pathname === '/api/health' && method === 'GET') {
      res.statusCode = 200;
      res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
      return true;
    }

    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await readBody();
      const user = registerUser(body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, user }));
      return true;
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await readBody();
      const user = loginUser(body);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, user }));
      return true;
    }

    if (pathname === '/api/user/sync' && method === 'POST') {
      const body = await readBody();
      if (!body.phone) {
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, error: 'Phone number required' }));
        return true;
      }
      const result = syncUserTransactions(body.phone, body.transactions || []);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ...result }));
      return true;
    }

    if (pathname === '/api/user/transactions' && method === 'GET') {
      const phone = parsedUrl.searchParams.get('phone');
      if (!phone) {
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, error: 'Phone query param required' }));
        return true;
      }
      const transactions = getUserTransactions(phone);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, transactions }));
      return true;
    }

    // Not handled by API
    return false;
  } catch (error) {
    res.statusCode = 400;
    res.end(JSON.stringify({ success: false, error: error.message }));
    return true;
  }
}
