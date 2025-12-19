import {itemsToRss} from "../rss.js"

export async function nhentai(query = "chinese") {
    const resp = await fetch(`https://nhentai.net/api/galleries/search?query=${query}&page=1&sort=new-uploads`);
    const data = await resp.json();

    const items = [];
    const now = Date.now();
    const extMap = {j: "jpg", p: "png", g: "gif", w: "webp"};

    // 用于去重的 Set，存储规范化后的标题（只去掉版本后缀）
    const seen = new Set();

    for (let i = 0; i < data.result.length; i++) {
        const item = data.result[i];

        const gid = item.id;
        const mediaId = item.media_id;

        // 优先级：日文标题 > 英文标题 > pretty标题
        let rawTitle = item.title.japanese || item.title.english || item.title.pretty || `Gallery ${gid}`;

        // 规范化标题：只移除版本后缀，保留核心作品名
        const normalizedTitle = rawTitle
            // 移除常见版本标记（括号或方括号内的）
            .replace(/\s*\[(無修正|DL版|中国(翻訳|汉化)|ページ欠落|ver\.\d+|C\d+)\]\s*/gi, ' ')
            // 移除末尾多余的方括号标签
            .replace(/\s*\[.*?\]\s*$/, '')
            // 清理多余空格
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();  // 统一大小写，避免大小写差异导致误判

        // 如果已经见过这个规范化后的标题，就跳过（同一作品只保留一个，通常是最新）
        if (seen.has(normalizedTitle)) {
            continue;
        }
        seen.add(normalizedTitle);

        // 保留原始标题（RSS 中显示完整标题，包括版本信息）
        const title = rawTitle;

        const tags = item.tags.map(t => t.name).join(", ");
        const pages = item.images.pages.length;

        const coverType = item.images.cover.t || "j";
        const coverExt = extMap[coverType] || "jpg";
        const cover = `https://t.nhentai.net/galleries/${mediaId}/cover.${coverExt}`;

        const images = item.images.pages.map((p, idx) => {
            const ext = extMap[p.t] || "jpg";
            return `https://i9.nhentai.net/galleries/${mediaId}/${idx + 1}.${ext}`;
        });

        const desc = `<![CDATA[
标签: ${tags}<br/>
页数: ${pages}<br/>
<img src="${cover}" /><br/>
${images.map(url => `<img src="${url}" />`).join("<br/>\n")}
]]>`;

        items.push({
            title,
            link: `https://nhentai.net/g/${gid}/`,
            description: desc,
            author: "nhentai",
            enclosure: {url: cover, type: "image/jpeg", length: "0"},
            guid: String(gid),
            pubDate: new Date(now - i * 1000).toUTCString(),
        });
    }

    const channel = {
        title: `${query} - nhentai`,
        description: `${query} - nhentai`,
        link: `https://nhentai.net/search/?q=${query}`,
        image: "https://nhentai.net/favicon.ico"
    };

    return itemsToRss(items, channel);
}