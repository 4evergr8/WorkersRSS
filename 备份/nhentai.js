import {Feed} from "feed";

export async function nhentai(query = "chinese") {
    const apiQuery = `${query} chinese`;
    const now = new Date();

    const feed = new Feed({
        title: `${query} - nhentai`,
        id: `https://nhentai.net/search/?q=${encodeURIComponent(apiQuery)}`,
        link: `https://nhentai.net/search/?q=${encodeURIComponent(apiQuery)}`,
        image: "https://nhentai.net/favicon.png",
        updated: now,
    });

    const seen = new Set();

    const firstResp = await fetch(`https://nhentai.net/api/v2/search?query=${encodeURIComponent(apiQuery)}&page=1`);
    if (!firstResp.ok) {
        const errText = await firstResp.text().catch(() => "");
        console.error("请求失败（第一页）");
        console.error("status:", firstResp.status);
        console.error("statusText:", firstResp.statusText);
        console.error("body:", errText);
        throw new Error(`nhentai API 请求失败: ${firstResp.status}`);
    }

    let firstData;
    try {
        firstData = await firstResp.json();
    } catch (e) {
        const raw = await firstResp.text().catch(() => "");
        console.error("JSON解析失败（第一页）");
        console.error("raw body:", raw);
        throw e;
    }

    const totalPages = firstData.num_pages || 1;

    for (let page = 1; page <= totalPages; page++) {
        const resp = await fetch(`https://nhentai.net/api/v2/search?query=${encodeURIComponent(apiQuery)}&page=${page}`);

        if (!resp.ok) {
            const errText = await resp.text().catch(() => "");
            console.error(`请求失败（page ${page}）`);
            console.error("status:", resp.status);
            console.error("statusText:", resp.statusText);
            console.error("body:", errText);
            continue;
        }

        let data;
        try {
            data = await resp.json();
        } catch (e) {
            const raw = await resp.text().catch(() => "");
            console.error(`JSON解析失败（page ${page}）`);
            console.error("raw body:", raw);
            continue;
        }

        if (!data.result || data.result.length === 0) continue;

        for (const item of data.result) {
            if (item.blacklisted) continue;

            const gid = item.id;
            const mediaId = item.media_id;

            const japaneseTitle = item.japanese_title || "";
            const englishTitle = item.english_title || "";

            const displayTitle = japaneseTitle || englishTitle || `Gallery ${gid}`;

            const uniqueId = displayTitle
                .replace(/\[.*?\]/g, '')
                .replace(/\(.*?\)/g, '')
                .replace(/\s/g, '')
                .replace(/\p{P}/gu, '')
                .toLowerCase();

            if (seen.has(uniqueId)) continue;
            seen.add(uniqueId);

            const pagesCount = item.num_pages || 0;

            const coverExt =
                item.thumbnail?.match(/\.(webp|jpg|png)$/i)?.[1]?.toLowerCase();

            const titleInDesc = (englishTitle && englishTitle.includes('|'))
                ? englishTitle.split('|').pop().trim()
                : englishTitle;

            const summaryDescription = (titleInDesc || "（无标题）").trim();

            const images = [`<p>${summaryDescription}</p>`];

            for (let p = 1; p <= pagesCount; p++) {
                const base = `https://i.nhentai.net/galleries/${mediaId}/${p}`;
                images.push(`<img src="${base}.${coverExt}" alt="P${p}/${pagesCount}" />`);
            }

            const cover = `https://i.nhentai.net/galleries/${mediaId}/1.${coverExt}`;

            const fullContent = images.join("");

            feed.addItem({
                title: displayTitle,
                guid: uniqueId,
                link: `https://nhentai.net/g/${gid}`,
                content: fullContent,
                author: [{name: query}],
                date: new Date(1600000000000 + gid * 1000),
                enclosure: cover,
            });
        }
    }

    return feed.rss2();
}