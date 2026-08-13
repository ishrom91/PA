import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;

  if (!serviceKey || !supabaseUrl) {
    return Response.json({ error: 'Server not configured' }, { status: 503 });
  }

  try {
    const { userId } = (await req.json()) as { userId: string };
    if (!userId) {
      return Response.json({ error: 'userId required' }, { status: 400 });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Delete failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
