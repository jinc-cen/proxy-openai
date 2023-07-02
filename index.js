const http = require('http');
const https = require('https');

const proxy = (req, res) => {
  // Ensure the request URL starts with "/v1/"
  if (req.method === 'POST' && req.url.startsWith('/v1/')) {
    let options = {
      hostname: 'api.openai.com',
      port: 443,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxy = https.request(options, function (targetRes) {
      res.writeHead(targetRes.statusCode, targetRes.headers);
      targetRes.pipe(res, {
        end: true
      });
    });

    req.pipe(proxy, {
      end: true
    });
  } else {
    res.writeHead(400);
    res.end('Bad request: Only POST method is allowed, and URL must start with /v1/');
  }
};

const server = http.createServer(proxy);
server.listen(3000); // Assuming you want the proxy server to listen on port 3000
