const HEADERS = {
    Authorization: `Basic ${Buffer.from(process.env.WAKATIME_API_KEY!).toString("base64")}`,
    Accept: "application/json",
};

type WakaTimeAllTime = {
    data: {
        total_seconds: number;
        text: string;
    };
};

export async function getAllTimeHours() {
    const res = await fetch(
        "https://api.wakatime.com/api/v1/users/current/all_time_since_today",
        {
            headers: HEADERS,
            next: { revalidate: 86400 }, // cache every 24 hours
        },
    );
    if (!res.ok) {
        throw new Error(`WakaTime API failed: ${res.status}`);
    }
    const json: WakaTimeAllTime = await res.json();
    return json.data;
}

export function secondsToHours(totalSeconds: number): number {
    return Math.floor(totalSeconds / 3600);
}
