import { Feed } from "feed";

export async function nhentai(input = "artist/mda-starou") {
    const now = new Date();

    const tagResp = await fetch(
        `https://nhentai.net/api/v2/tags/${input}`
    );

    if (!tagResp.ok) {
        throw new Error("tag请求失败");
    }

    const tagData = await tagResp.json();
    const tagId = tagData.id;

    const feed = new Feed({
        title: `${input} - nhentai`,
        id: `https://nhentai.net/${input}/`,
        link: `https://nhentai.net/${input}/`,
        image: "https://nhentai.net/favicon.png",
        updated: now,
    });

    const seen = new Set();

    let page = 1;
    const perPage = 100;
    let hasMore = true;

    const MUST_TAG = 29963;

    const cleanText = (text = "") =>
        text
            .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
            .trim();

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

            // 必须包含中文标签
            if (!item.tag_ids?.includes(MUST_TAG)) {
                continue;
            }


            const gid = item.id;
            const mediaId = item.media_id;

            const japaneseTitle = cleanText(
                item.japanese_title || ""
            );

            const englishTitle = cleanText(
                item.english_title || ""
            );

            // item.title
            const title =
                japaneseTitle ||
                englishTitle;

            // 去重/guid
            const uniqueId = title
                .replace(/\[.*?\]/g, "")
                .replace(/\(.*?\)/g, "")
                .replace(/\s/g, "")
                .replace(/\p{P}/gu, "")
                .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
                .toLowerCase();

            if (seen.has(uniqueId)) {
                continue;
            }

            seen.add(uniqueId);

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

                images.push(`<img src="${imgUrl}" />`);
            }

            feed.addItem({
                title,
                id: uniqueId,
                link: `https://nhentai.net/g/${gid}/`,
                content: images.join(""),
                date: new Date(1600000000000 + gid * 1000),
                enclosure: `https://i.nhentai.net/galleries/${mediaId}/1.${coverExt}`,
                author:  [{name: input}]
            });
        }

        hasMore = page < data.num_pages;
        page++;
    }

    return feed.rss2();
}