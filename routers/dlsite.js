import * as cheerio from "cheerio"
import { Feed } from "feed";

export async function dlsite(RG) {
    const resp = await fetch(`https://www.dlsite.com/maniax/circle/profile/=/maker_id/${RG}.html/per_page/30`)
    console.log("dlsite:", RG)
    const html = await resp.text()

    const $ = cheerio.load(html)
    const title = $('#main_inner > div:nth-child(1) > h1 > span').text().trim()

    const now = new Date();
    const feed = new Feed({
        title: `${title} - DLSite`,
        description: `${title} - DLSite`,
        id: `https://www.dlsite.com/maniax/circle/profile/=/maker_id/${RG}.html`,
        link: `https://www.dlsite.com/maniax/circle/profile/=/maker_id/${RG}.html`,
        language: "zh",
        image: "https://www.dlsite.com/favicon.ico",
        updated: now,
        generator: "Feed for Node.js",
        author: {
            name: "DLSite",
            link: "https://www.dlsite.com"
        }
    });

    $("#search_result_img_box > li.search_result_img_box_inner").each((i, el) => {
        const itemTitle = $(el).find("dd.work_name a").attr("title") || ""
        const link = $(el).find("dd.work_name a").attr("href") || ""
        const author = $(el).find("dd.maker_name a").first().text().trim() || ""

        let image = ""
        $(el).find("img").each((j, imgEl) => {
            let src = $(imgEl).attr("data-src") || $(imgEl).attr("src") || ""
            if (src && !src.startsWith("data:")) {
                image = src
                return false
            }
        })

        let fullImage = image.startsWith("//") ? "https:" + image : image
        fullImage = fullImage.replace("/resize/", "/modpub/").replace(/main_240x240\.jpg$/, "main.webp")
        let image1 = fullImage.replace("_main.webp", "_smp1.webp")
        let image2 = fullImage.replace("_main.webp", "_smp2.webp")

        const price = $(el).find("span.work_price_base").first().text().trim() || ""
        const genre = $(el).find("dd div a").first().text().trim() || ""
        const sales = $(el).find("dd.work_dl span").text().trim() || ""

        const summaryDescription = `作者: ${author} | 类型: ${genre} | 价格: ${price} | 销量: ${sales}`;
        const fullContent = `
<p>${summaryDescription}</p>
<img src="${fullImage}" />
<img src="${image1}" />
<img src="${image2}" />
`;

        feed.addItem({
            title: itemTitle,
            id: link,
            link: link,
            description: fullContent,
            author: [{ name: author }],
            date: new Date(now.getTime() - i * 1000),
            image: fullImage
        })
    })

    return feed.rss2()
}