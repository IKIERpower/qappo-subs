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
        const res = await fetch("https://subs.qappo.pl/api/cron/check-renewals", {
            method: "GET",
            headers: env.CRON_SECRET
                ? {
                    Authorization: `Bearer ${env.CRON_SECRET}`,
                }
                : {},
        });

        const text = await res.text();

        console.log("Cron response status:", res.status);
        console.log("Cron response body:", text);

        if (!res.ok) {
            throw new Error(`Cron failed: ${res.status} ${text}`);
        }
    },
};

// @ts-ignore
export * from "./.open-next/worker.js";
