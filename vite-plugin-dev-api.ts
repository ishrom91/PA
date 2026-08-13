import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function pipeWebResponse(webRes: Response, res: ServerResponse) {
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'transfer-encoding') return;
    res.setHeader(key, value);
  });
  if (!webRes.body) {
    res.end();
    return;
  }
  const reader = webRes.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}

/** Local /api/* in Vite dev (production uses Vercel serverless). */
export function devApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlPath = req.url?.split('?')[0];
        if (urlPath !== '/api/mentor') return next();

        process.env.GROQ_API_KEY = env.GROQ_API_KEY ?? process.env.GROQ_API_KEY;

        try {
          const { default: handler } = await server.ssrLoadModule('/api/mentor.ts');
          const host = req.headers.host ?? 'localhost:5173';
          const body = req.method === 'POST' || req.method === 'PUT' ? await readBody(req) : undefined;
          const request = new Request(`http://${host}${req.url}`, {
            method: req.method,
            headers: req.headers as HeadersInit,
            body: body?.length ? body : undefined,
          });
          const response = await handler(request);
          await pipeWebResponse(response, res);
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Dev API error';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}
