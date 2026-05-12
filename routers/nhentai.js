import { Feed } from "feed";

export async function nhentai(query = "chinese") {
    const apiQuery = `${query}+chinese`;
    const displayName = query.replace(/\+/g, ' ');
    const now = new Date();

    const feed = new Feed({
        title: `${displayName} - nhentai`,
        description: `nhentai : ${displayName}`,
        id: `https://nhentai.net/search/?q=${encodeURIComponent(apiQuery)}`,
        link: `https://nhentai.net/search/?q=${encodeURIComponent(apiQuery)}`,
        language: "zh",
        image: "https://nhentai.net/favicon.ico",
        copyright: "All rights reserved",
        updated: now,
        generator: "Feed for Node.js",
        author: {
            name: displayName,
            link: `https://nhentai.net/search/?q=${encodeURIComponent(apiQuery)}`
        }
    });

    const seen = new Set();

    const firstResp = await fetch(`https://nhentai.net/api/v2/search?query=${encodeURIComponent(apiQuery)}&page=1`);
    if (!firstResp.ok) throw new Error(`nhentai API 请求失败: ${firstResp.status}`);
    const firstData = await firstResp.json();
    const totalPages = firstData.num_pages || 1;

    for (let page = 1; page <= totalPages; page++) {
        const resp = await fetch(`https://nhentai.net/api/v2/search?query=${encodeURIComponent(apiQuery)}&page=${page}`);
        if (!resp.ok) continue;
        const data = await resp.json();
        if (!data.result || data.result.length === 0) continue;

        for (const item of data.result) {
            if (item.blacklisted) continue;

            const gid = item.id;
            const mediaId = item.media_id;
            const japaneseTitle = item.japanese_title || "";
            const englishTitle = item.english_title || "";
            const displayTitle = japaneseTitle || englishTitle || `Gallery ${gid}`;

            // 原有逻辑保留：正则过滤
            const normalizedTitle = displayTitle
                .replace(/\s*\[(無修正|DL版|中国(翻訳|汉化)|ページ欠落|ver\.\d+|C\d+|AI翻译|AI generated)\]\s*/gi, ' ')
                .replace(/\s*\[.*?\]\s*$/, '')
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase();

            if (seen.has(normalizedTitle)) continue;
            seen.add(normalizedTitle);

            const pagesCount = item.num_pages || 0;
            const cover = `https://t.nhentai.net/${item.thumbnail}`;

            // 原有逻辑保留：标题逻辑
            const titleInDesc = (englishTitle && englishTitle.includes('|'))
                ? englishTitle.split('|').pop().trim()
                : englishTitle;

            const summaryDescription =(titleInDesc || "（无标题）").trim();

            // 1. 构建 Content (Description 放在顶部 + 死循环重试图片)
            const images = [`<p>${summaryDescription}</p>`];
            for (let p = 1; p <= pagesCount; p++) {
                const base = `https://i.nhentai.net/galleries/${mediaId}/${p}`;
                const webp = `${base}.webp`;
                const jpg = `${base}.jpg`;
                const png = `${base}.png`;

                images.push(`
<img 
    src="${webp}" 
    alt="P${p}/${pagesCount}" 
    onerror="
        if (this.src.endsWith('.webp')) {
            this.src = '${jpg}';
        } else if (this.src.endsWith('.jpg')) {
            this.src = '${png}';
        } else if (this.src.endsWith('.png')) {
            this.src = '${webp}'; 
        }
    " 
/>`);
            }

            const fullContent = images.join("");

            // 3. 添加到 Feed
            feed.addItem({
                title: displayTitle,
                id: String(gid),
                link: `https://nhentai.net/g/${gid}/`,
                description: fullContent,
                author: [{name: displayName}],
                date: new Date(now.getTime() - feed.items.length * 1000),
                image: cover
            });
        }
    }

    return feed.rss2();
}