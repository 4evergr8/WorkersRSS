import { itemsToRss } from "../rss.js";

export async function nhentai(query = "chinese") {
    const resp = await fetch(`https://nhentai.net/api/v2/search?query=${encodeURIComponent(query)}&page=1`, {
    });

    if (!resp.ok) {
        throw new Error(`nhentai API 请求失败: ${resp.status}`);
    }

    const data = await resp.json();

    const items = [];
    const now = Date.now();
    const seen = new Set(); // 用于去重

    for (let i = 0; i < data.result.length; i++) {
        const item = data.result[i];

        if (item.blacklisted) continue;

        const gid = item.id;
        const mediaId = item.media_id;

        // 日语和英语标题
        const japaneseTitle = item.japanese_title || "";
        const englishTitle = item.english_title || "";

        // RSS 标题：有日语用日语，没有日语用英语
        let displayTitle = japaneseTitle || englishTitle || `Gallery ${gid}`;

        // 规范化标题用于去重（基于 displayTitle）
        const normalizedTitle = displayTitle
            .replace(/\s*\[(無修正|DL版|中国(翻訳|汉化)|ページ欠落|ver\.\d+|C\d+|AI翻译|AI generated)\]\s*/gi, ' ')
            .replace(/\s*\[.*?\]\s*$/, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();

        if (seen.has(normalizedTitle)) {
            continue;
        }
        seen.add(normalizedTitle);

        const pages = item.num_pages || 0;

        // 封面
        const cover = `https://t.nhentai.net/${item.thumbnail}`;

        // 图片链接（使用 i.nhentai.net）
        const images = [];
        for (let p = 1; p <= pages; p++) {
            images.push(`https://i.nhentai.net/galleries/${mediaId}/${p}.webp`);
        }

        // 正文同时显示英语和日语标题
        const desc = `<![CDATA[
日语标题: ${japaneseTitle || "（无）"}<br/>
英语标题: ${englishTitle || "（无）"}<br/>
页数: ${pages}<br/>
<img src="${cover}" alt="cover" /><br/>
${images.map(url => `<img src="${url}" alt="page" />`).join("<br/>\n")}
]]>`;

        items.push({
            title: displayTitle,
            link: `https://nhentai.net/g/${gid}/`,
            description: desc,
            author: "nhentai",
            enclosure: { url: cover, type: "image/jpeg", length: "0" },
            guid: String(gid),
            pubDate: new Date(now - i * 1000).toUTCString(),
        });
    }

    const channel = {
        title: `${query} - nhentai`,
        description: `nhentai 搜索: ${query}`,
        link: `https://nhentai.net/search/?q=${encodeURIComponent(query)}`,
        image: "https://nhentai.net/favicon.ico"
    };

    return itemsToRss(items, channel);
}