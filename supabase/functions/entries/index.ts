// @ts-nocheck

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STRAPI_SYNC_URL =
  Deno.env.get("STRAPI_SYNC_URL") ||
  "http://host.docker.internal:1337/api/supabase-sync";


function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors() },
  });
}

async function notifyStrapi(row: any) {
  if (!STRAPI_SYNC_URL) return;
  try {
    const res = await fetch(STRAPI_SYNC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        title: row.title,
        description: row.description,
        timestamp: row.timestamp ?? row.created_at ?? null,
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("Strapi sync failed:", res.status, t);
    }
  } catch (e) {
    console.error("Strapi sync exception:", e);
  }
}

serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors() });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase.from("entries").select("*");
    if (error) return json(error, 400);
    return json(data, 200);
  }

  if (req.method === "POST") {
    const { title, description, timestamp } = await req.json();
    if (!title) return json({ error: "title required" }, 400);

    const { data, error } = await supabase
      .from("entries")
      .insert([
        {
          title,
          description,
          timestamp: timestamp || new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) return json(error, 400);

    await notifyStrapi(data);

    return json(data, 201);
  }

  if (req.method === "PATCH") {
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id query param required (?id=...)" }, 400);

    const payload = await req.json();
    const { data, error } = await supabase
      .from("entries")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) return json(error, 400);

    await notifyStrapi(data);

    return json(data, 200);
  }

  return new Response("Method Not Allowed", { status: 405, headers: cors() });
});
