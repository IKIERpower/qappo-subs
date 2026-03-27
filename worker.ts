async scheduled(_controller: any, env: Env, _ctx: any) {
    console.log("CRON_SECRET exists in worker:", !!env.CRON_SECRET);

    const headers: Record<string, string> = {};

    if (env.CRON_SECRET) {
        headers.Authorization = `Bearer ${env.CRON_SECRET}`;
    }

    console.log("Will send auth header:", !!headers.Authorization);

    const res = await fetch("https://qappo-subs.contact-qappo.workers.dev/api/cron/check-renewals", {
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
