import { itemsToRss } from "../rss.js";

export async function nhentai(query = "chinese") {
    // 构造 API 查询参数，末尾强制加 +chinese
    const apiQuery = `${query}+chinese`;

    // 显示名称：将 + 替换为空格
    const displayName = query.replace(/\+/g, ' ');

    const items = [];
    const seen = new Set(); // 去重
    const now = Date.now();

    // 先请求第一页，获取总页数
    const firstResp = await fetch(`https://nhentai.net/api/v2/search?query=${encodeURIComponent(apiQuery)}&page=1`);
    if (!firstResp.ok) {
        throw new Error(`nhentai API 请求失败: ${firstResp.status}`);
    }
    const firstData = await firstResp.json();

    const totalPages = firstData.num_pages || 1;

    // 遍历所有页
    for (let page = 1; page <= totalPages; page++) {
        const resp = await fetch(`https://nhentai.net/api/v2/search?query=${encodeURIComponent(apiQuery)}&page=${page}`);
        if (!resp.ok) {
            console.warn(`请求第 ${page} 页失败: ${resp.status}, 跳过`);
            continue;
        }
        const data = await resp.json();
        if (!data.result || data.result.length === 0) continue;

        for (let i = 0; i < data.result.length; i++) {
            const item = data.result[i];

            if (item.blacklisted) continue;

            const gid = item.id;
            const mediaId = item.media_id;

            const japaneseTitle = item.japanese_title || "";
            const englishTitle = item.english_title || "";

            // RSS 标题：日语优先
            let displayTitle = japaneseTitle || englishTitle || `Gallery ${gid}`;

            const normalizedTitle = displayTitle
                .replace(/\s*\[(無修正|DL版|中国(翻訳|汉化)|ページ欠落|ver\.\d+|C\d+|AI翻译|AI generated)\]\s*/gi, ' ')
                .replace(/\s*\[.*?\]\s*$/, '')
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase();

            if (seen.has(normalizedTitle)) continue;
            seen.add(normalizedTitle);

            const pages = item.num_pages || 0;
            const cover = `https://t.nhentai.net/${item.thumbnail}`;

            const images = [];
            for (let p = 1; p <= pages; p++) {
                images.push(`https://i.nhentai.net/galleries/${mediaId}/${p}.webp`);
            }

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
                pubDate: new Date(now - (items.length) * 1000).toUTCString(),
            });
        }
    }

    const channel = {
        title: `${displayName} - nhentai`,
        description: `nhentai 搜索: ${displayName}`,
        link: `https://nhentai.net/search/?q=${encodeURIComponent(apiQuery)}`,
        image: "https://nhentai.net/favicon.ico"
    };

    return itemsToRss(items, channel);
}