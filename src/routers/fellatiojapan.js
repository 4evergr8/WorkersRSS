import * as cheerio from "cheerio";
import { Feed } from "feed";

export async function fellatiojapan(model, baseUrl) {

    const currentRssUrl =
        `${baseUrl}?fellatiojapan=${encodeURIComponent(model)}`;

    const profileUrl =
        `https://www.fellatiojapan.com/en/girl/${encodeURIComponent(model)}`;

    const resp = await fetch(profileUrl);

    const html = await resp.text();

    const $ = cheerio.load(html);

    const now = new Date();

    const feed = new Feed({
        title: `${model} - Fellatio Japan`,
        id: profileUrl,
        link: profileUrl,
        image: "https://www.fellatiojapan.com/favicon.ico",
        updated: now,
        feedLinks: {
            rss: currentRssUrl
        }
    });

    $(".scene-obj").each((i, el) => {

        const sceneImg =
            $(el).find(".scene-img");

        const style =
            sceneImg.attr("style") || "";

        const previewImage =
            style.match(/url\((.*?)\)/)?.[1] || "";

        const previewId =
            sceneImg
                .find(".scene-hover")
                .attr("data-path") || "";

        const previewVideo =
            previewId
                ? `https://cdn.fellatiojapan.com/preview/${previewId}/hover.mp4`
                : "";

        const girls =
            $(el)
                .find(".sGirl a")
                .map((_, a) => $(a).text().trim())
                .get();

        const title =
            previewId || girls.join(" & ");

        const orangeText =
            $(el)
                .find(".data.orange")
                .text()
                .trim();

        const duration =
            orangeText.split("/")[0]?.trim() || "";

        const photos =
            orangeText.match(/(\d+)\s*photos/i)?.[1] || "";

        const publishDate =
            $(el)
                .find(".sDate")
                .text()
                .trim();

        const tags =
            $(el)
                .find(".data.dark a")
                .map((_, a) => $(a).text().trim())
                .get();

        const summaryDescription =
            `演员: ${girls.join(" & ")} | 时长: ${duration}${photos ? ` | 图片: ${photos}` : ""} | 日期: ${publishDate} | 标签: ${tags.join(", ")}`;

        const content = `
<p>${summaryDescription}</p>

<p>预览图片</p>

<img src="${previewImage}" />

${previewVideo ? `
<p>预览视频</p>

<video controls preload="none">
    <source src="${previewVideo}" type="video/mp4">
</video>
` : ""}
`;

        feed.addItem({
            title,
            id: previewId || previewImage,
            link: profileUrl,
            description: summaryDescription,
            content,

            author: girls.map(name => ({
                name
            })),

            date: publishDate
                ? new Date(`${publishDate}T00:00:00Z`)
                : now,

            image: previewImage,

            enclosure: {
                url: previewImage,
                type: "image/jpeg"
            }
        });
    });

    return feed.rss2();
}