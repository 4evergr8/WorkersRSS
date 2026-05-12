import { Feed } from "feed";

export async function kemono(ID) {
    const resp = await fetch(`https://kemono.cr/api/v1/${ID}/posts`, {
        headers: {
            "Accept": "application/json",
        }
    });
    console.log("kemono:", ID);
    const data = await resp.json();

    const now = new Date();
    const feed = new Feed({
        title: `${ID} - Kemono`,
        description: `${ID} - Kemono`,
        id: `https://kemono.cr/${ID}`,
        link: `https://kemono.cr/${ID}`,
        language: "zh",
        image: "https://kemono.cr/static/apple-touch-icon.png",
        updated: now,
        generator: "Feed for Node.js",
        author: {
            name: "Kemono",
            link: "https://kemono.cr"
        }
    });

    for (const post of data) {
        const title = post.title || "无标题";
        const link = `https://kemono.cr/${post.service}/user/${post.user}/post/${post.id}`;
        const contentHtml = post.content || post.substring || "";
        const datetime = post.published || "";

        const enclosureUrl = post.file?.path
            ? `https://kemono.cr/data${post.file.path}`
            : "https://kemono.cr/static/noimage.png";

        const fullContent = `
${contentHtml}
<br><br>
<img src="${enclosureUrl}" />
`;

        feed.addItem({
            title: title,
            id: link,
            link: link,
            description: contentHtml.substring(0, 200),
            content: fullContent,
            author: [{ name: post.user }],
            date: datetime ? new Date(datetime) : now,
            image: enclosureUrl
        });
    }

    return feed.rss2();
}