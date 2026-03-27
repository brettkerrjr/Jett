/**
 * Jett Proxy Worker
 * Proxies Anthropic API calls so the key never touches the client.
 *
 * Env vars (set via: wrangler secret put <NAME>):
 *   ANTHROPIC_KEY  — your Anthropic API key (sk-ant-...)
 *   JETT_TOKEN     — a secret token you choose; Jett sends this as Bearer
 *
 * Deploy: wrangler deploy
 * Local:  wrangler dev
 */

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS });
    }

    // Validate bearer token
    const auth = request.headers.get('Authorization') || '';
    const token = auth.replace(/^Bearer\s+/, '');
    if (!env.JETT_TOKEN || token !== env.JETT_TOKEN) {
      return new Response('Unauthorized', { status: 401, headers: CORS });
    }

    // Parse and forward body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Bad request — invalid JSON', { status: 400, headers: CORS });
    }

    const upstream = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  },
};
