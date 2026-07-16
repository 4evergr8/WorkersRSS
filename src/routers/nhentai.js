import { Feed } from "feed";

export async function nhentai(input,baseUrl) {
    const now = new Date();
    const currentRssUrl = `${baseUrl}?nhentai=${input}`;

    const tagResp = await fetch(
        `https://nhentai.net/api/v2/tags/${input}`
    );

    if (!tagResp.ok) {
        throw new Error("tag请求失败");
    }

    const tagData = await tagResp.json();
    const tagId = tagData.id;

    const feed = new Feed({
        feedLinks: {rss: currentRssUrl},
        image: "https://nhentai.net/favicon.png",
        link: `https://nhentai.net/${input}/`,
        title: `nhentai - ${input}`,
        updated: now,
    });

    // 中文
    const CHINESE_TAG = 29963;

    // 英语
    const ENGLISH_TAG = 12227;

    // 日语
    const JAPANESE_TAG = 6346;

    // 优先级
    const getLangPriority = (tagIds = []) => {
        if (tagIds.includes(CHINESE_TAG)) {
            return 4;
        }

        if (tagIds.includes(ENGLISH_TAG)) {
            return 3;
        }

        if (tagIds.includes(JAPANESE_TAG)) {
            return 2;
        }

        return 1;
    };

    const cleanText = (text = "") =>
        String(text || "")
            .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
            .trim();

    // key: uniqueId
    // value: { priority, item }
    const works = new Map();

    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
        const url =
            `https://nhentai.net/api/v2/galleries/tagged` +
            `?tag_id=${tagId}&sort=date&page=${page}&per_page=${perPage}`;

        const resp = await fetch(url);

        if (!resp.ok) {
            throw new Error(`page ${page} 请求失败`);
        }

        const data = await resp.json();

        if (!data.result || data.result.length === 0) {
            break;
        }

        for (const item of data.result) {

            const gid = item.id;
            const mediaId = item.media_id;

            const japaneseTitle = cleanText(
                item.japanese_title 
            );

            const englishTitle = cleanText(
                item.english_title 
            );

            const title =
                japaneseTitle ||
                englishTitle;

            const uniqueId = title
                .replace(/\[.*?]/g, "")
                .replace(/\(.*?\)/g, "")
                .replace(/\s/g, "")
                .replace(/\p{P}/gu, "")
                .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
                .toLowerCase();

            const tagIds = item.tag_ids || [];

            const priority = getLangPriority(tagIds);

            // content标题
            let contentTitle = "";

            if (englishTitle) {
                if (englishTitle.includes("|")) {
                    contentTitle = englishTitle
                        .split("|")
                        .pop()
                        .trim();
                } else {
                    contentTitle = englishTitle;
                }
            } else {
                contentTitle = japaneseTitle;
            }

            contentTitle = cleanText(contentTitle);

            const pagesCount = item.num_pages || 0;
            const coverExt =
                item.thumbnail
                    ?.match(/\.(webp|jpg|png)$/i)?.[1]
                    ?.toLowerCase() || "jpg";

            const images = [`<p>${contentTitle}</p>`];

            for (let p = 1; p <= pagesCount; p++) {
                const imgUrl =
                    `https://i.nhentai.net/galleries/${mediaId}/${p}.${coverExt}`;

                images.push(`<img src="${imgUrl}"  alt="P${p}/${pagesCount}"/>`);
            }


            const feedItem = {
                author: [{ name: input }],
                content: images.join(""),
                date: new Date(1600000000000 + gid * 1000),
                id: `https://nhentai.net/g/${gid}/`,
                link: `https://nhentai.net/g/${gid}/`,
                title:title


            };

            const old = works.get(uniqueId);

            // 不存在
            if (!old) {
                works.set(uniqueId, {
                    priority,
                    item: feedItem
                });

                continue;
            }

            // 新版本优先级更高，替换
            if (priority > old.priority) {
                works.set(uniqueId, {
                    priority,
                    item: feedItem
                });
            }
        }

        hasMore = page < data.num_pages;
        page++;
    }

    for (const { item } of works.values()) {
        feed.addItem(item);
    }

    return feed.rss2();
}