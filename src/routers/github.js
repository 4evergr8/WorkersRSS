import {Feed} from "feed";

export async function github(REP, baseUrl) {
    const apiUrl = `https://api.github.com/repos/${REP}/releases`;
    const currentRssUrl = `${baseUrl}?github=${REP}`;


    const resp = await fetch(apiUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
            "Accept": "application/vnd.github.v3+json",
            "Accept-Language": "zh-CN,zh;q=0.9",
        }
    });

    if (!resp.ok) {
        throw new Error(`GitHub API 请求失败: ${resp.status}`);
    }

    const releases = await resp.json();

    const now = new Date();

    const feed = new Feed({
        feedLinks: {rss: currentRssUrl},
        image: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
        link: `https://github.com/${REP}/releases`,
        title: `Github - ${REP}`,
        updated: now,
    });

    for (const r of releases) {

        // 所有 asset 下载链接
        const assetsHtml = (r.assets || []).map(a => {
            return `
<p>
<a href="${a.browser_download_url}">${a.name}</a><br/>
大小: ${(a.size / 1024 / 1024).toFixed(2)} MB<br/>
下载: ${a.download_count}<br/>
SHA256: ${a.digest || "无"}
</p>
`;
        }).join("");

        // release 正文 + assets
        const fullContent = `
<div>
${(r.body || "").replace(/\n/g, "<br/>")}
</div>

<br/>

<div>
<strong>Assets</strong>
${assetsHtml}
</div>
`;

        feed.addItem({
            author: [{name: r.author?.login}],
            content: fullContent,
            date: new Date(r.published_at),
            enclosure: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
            id: r.html_url,
            link: r.html_url,
            title: r.name
        });
    }

    return feed.rss2();
}