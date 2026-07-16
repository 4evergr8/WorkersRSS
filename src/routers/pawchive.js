import { Feed } from "feed";

export async function pawchive(input, baseUrl) {
    const now = new Date();

    const currentRssUrl = `${baseUrl}?pawchive=${input}`;

    const apiBase = "https://pawchive.pw/api/v1/";

    const profileResp = await fetch(
        `${apiBase}${input}/profile`
    );

    if (!profileResp.ok) {
        throw new Error("profile请求失败");
    }

    const profile = await profileResp.json();

    const postResp = await fetch(
        `${apiBase}${input}/posts`
    );

    if (!postResp.ok) {
        throw new Error("post请求失败");
    }

    const posts = await postResp.json();


    const feed = new Feed({
        title: `${profile.name} - pawchive`,
        id: `https://pawchive.pw/${input}`,
        link: `https://pawchive.pw/${input}`,
        image: "https://pawchive.pw/favicon.ico",
        updated: now,
        feedLinks: {
            rss: currentRssUrl
        },
    });


    const fileUrl = (path) => {
        if (!path) {
            return "";
        }

        return `https://pawchive.pw/data/file${path}`;
    };


    const cleanText = (text = "") =>
        text
            .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
            .trim();


    for (const post of posts) {

        const content = post.content || "";

        const images = [];

        if (post.file?.path) {
            images.push(
                `<img src="${fileUrl(post.file.path)}" alt="${post.file.name || ""}"/>`
            );
        }


        for (const attachment of post.attachments || []) {

            if (!attachment.path) {
                continue;
            }

            images.push(
                `<img src="${fileUrl(attachment.path)}" alt="${attachment.name || ""}"/>`
            );
        }


        const fullContent =
            content +
            images.join("");


        const cover =
            post.file?.path
                ? fileUrl(post.file.path)
                : "";


        feed.addItem({
            title: cleanText(post.title || "untitled"),

            id: `${profile.id}-${post.id}`,

            link:
                `https://pawchive.pw/${input}/post/${post.id}`,

            content: fullContent,

            date: new Date(post.published || post.added),

            enclosure: cover
                ? cover
                : undefined,

            author: [
                {
                    name: profile.name
                }
            ]
        });
    }


    return feed.rss2();
}