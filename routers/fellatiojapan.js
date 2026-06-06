import * as cheerio from "cheerio"
import { Feed } from "feed";

export async function fellatiojapan(model) {
    const resp = await fetch(`https://fellatiojapan.com/en/girl/${model}`)
    const html = await resp.text()
    const $ = cheerio.load(html)

    const pagetitle = $("#content h1").first().text().trim()

    const now = new Date();
    const feed = new Feed({
        title: `${pagetitle} - Fellatio Japan`,
        description: `${pagetitle} - Fellatio Japan`,
        id: `https://fellatiojapan.com/en/girl/${model}`,
        link: `https://fellatiojapan.com/en/girl/${model}`,
        language: "en",
        image: "https://cdn.fellatiojapan.com/img/svg2.png",
        updated: now,
        generator: "Feed for Node.js",
        author: {
            name: "Fellatio Japan",
            link: "https://fellatiojapan.com"
        }
    });

    $(".scene-obj").each((i, el) => {
        const title = $(el).find(".sGirl a").first().text().trim() || "Fellatio Japan Scene"
        const link = $(el).find(".scene-top").attr("href") || ""
        const authors = $(el).find(".sGirl a").map((i, a) => $(a).text().trim()).get().join(", ")

        // 主图（背景图）
        let image = ""
        const bgStyle = $(el).find(".scene-img").attr("style") || ""
        const match = bgStyle.match(/url\(([^)]+)\)/)
        if (match) {
            image = match[1].replace(/['"]/g, "")
            if (!image.startsWith("http")) image = "https://cdn.fellatiojapan.com" + image
        }

        // 标签
        const tags = $(el).find(".data.dark a").map((j, tagEl) => $(tagEl).text().trim()).get().join(", ")

        // 日期
        const dateStr = $(el).find(".sDate").text().trim()

        const summaryDescription = `模特: ${authors} | 标签: ${tags} | 日期: ${dateStr}`;
        const fullContent = `
<p>${summaryDescription}</p>
<img src="${image}" />
`;

        feed.addItem({
            title: title,
            id: image || link,
            link: link.startsWith("http") ? link : `https://fellatiojapan.com${link}`,
            description: fullContent,
            author: [{ name: authors }],
            date: dateStr ? new Date(dateStr) : new Date(now.getTime() - i * 1000),
            image: image
        })
    })

    return feed.rss2()
}