// @ts-ignore
import worker from "./.open-next/worker.js";

type Env = {
    CRON_SECRET?: string;
};

export default {
    async fetch(request: Request, env: Env, ctx: any) {
        return worker.fetch(request, env, ctx);
    },

   async scheduled(_controller: any, env: Env, _ctx: any) {
  console.log("CRON_SECRET exists in worker:", !!env.CRON_SECRET);

  const headers = env.CRON_SECRET
    ? { Authorization: `Bearer ${env.CRON_SECRET}` }
    : {};

  console.log("Will send auth header:", "Authorization" in headers);

  const res = await fetch("https://subs.qappo.pl/api/cron/check-renewals", {
    method: "GET",
    headers,
  });

  const text = await res.text();

  console.log("Cron response status:", res.status);
  console.log("Cron response body:", text);

  if (!res.ok) {
    throw new Error(`Cron failed: ${res.status} ${text}`);
  }
}
};

// @ts-ignore
export * from "./.open-next/worker.js";
