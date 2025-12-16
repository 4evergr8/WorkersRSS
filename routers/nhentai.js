import {itemsToRss} from "../rss.js"

export async function nhentai(query = "chinese") {
    const resp = await fetch(`https://nhentai.net/api/galleries/search?query=${query}&page=1&sort=new-uploads`);
    const data = await resp.json();

    const items = [];
    const now = Date.now();
    const extMap = {j: "jpg", p: "png", g: "gif", w: "webp"};

    // 用于去重的 Set，存储规范化后的标题（去掉常见后缀）
    const seen = new Set();

    for (let i = 0; i < data.result.length; i++) {
        const item = data.result[i];

        const gid = item.id;
        const mediaId = item.media_id;

        // 优先级：日文标题 > 英文标题 > pretty标题
        let rawTitle = item.title.japanese || item.title.english || item.title.pretty || `Gallery ${gid}`;

        // 提取核心标题：去除常见的版本后缀（如 [中国翻訳], [DL版], [無修正], ver.2 等）
        const normalizedTitle = rawTitle
            .replace(/\s*[[\(]中国(翻訳|汉化)[\]\)]\s*/g, '')
            .replace(/\s*[[\(]DL版[\]\)]\s*/g, '')
            .replace(/\s*[[\(]無修正?[\]\)]\s*/g, '')
            .replace(/\s*ver\.\d+\s*/gi, '')
            .replace(/\s*[\(（].*?[\)）]\s*$/, '')  // 去掉末尾括号内容
            .trim();

        // 组合作者（圈子）+ 规范化标题 作为唯一键
        const circle = item.tags.find(t => t.type === "artist")?.name ||
            item.tags.find(t => t.type === "group")?.name ||
            "unknown";
        const uniqueKey = `${circle}|${normalizedTitle}`;

        // 如果已经见过这个核心作品，就跳过
        if (seen.has(uniqueKey)) {
            continue;
        }
        seen.add(uniqueKey);

        // 保留原始标题（用户还是想看到完整标题，包括版本信息）
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