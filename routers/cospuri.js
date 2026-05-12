import * as cheerio from "cheerio"
import { Feed } from "feed";

export async function cospuri(model) {
    const resp = await fetch(`https://cospuri.com/model/${model}`)
    console.log("cospuri:", model)
    const html = await resp.text()
    const $ = cheerio.load(html)
    const title = $('div.name-en').text().trim()

    const now = new Date();
    const feed = new Feed({
        title: `${title} - Cospuri`,
        description: `${title} - Cospuri`,
        id: `https://cospuri.com/model/${model}`,
        link: `https://cospuri.com/model/${model}`,
        language: "zh",
        image: "https://cdn.cospuri.com/img/banner_1.jpg",
        updated: now,
        generator: "Feed for Node.js",
        author: {
            name: "Cospuri",
            link: "https://cospuri.com"
        }
    });

    $(".scene.cosplay").each((i, el) => {
        const itemTitle = $(el).find(".model a").first().text().trim() || "Cospuri Scene"
        const link = $(el).find("a").first().attr("href") || ""
        const author = $(el).find(".model a").first().text().trim() || ""

        // 主图（背景图）
        let image = ""
        const bgStyle = $(el).find(".scene-thumb").attr("style") || ""
        const match = bgStyle.match(/url\(([^)]+)\)/)
        if (match) {
            image = match[1].replace(/['"]/g, "")
            if (!image.startsWith("http")) image = "https://www.cospuri.com" + image
        }

        // 标签
        const tags = $(el).find(".tags a").map((j, tagEl) => $(tagEl).text().trim()).get().join(", ")

        const summaryDescription = `模特: ${author} | 标签: ${tags}`;
        const fullContent = `
<p>${summaryDescription}</p>
<img src="${image}" />
`;

        feed.addItem({
            title: itemTitle,
            id: link,
            link: link.startsWith("http") ? link : "https://www.cospuri.com" + link,
            description: fullContent,
            author: [{ name: author }],
            date: new Date(now.getTime() - i * 1000),
            image: image
        })
    })

    return feed.rss2()
}