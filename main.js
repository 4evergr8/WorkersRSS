import { dlsite } from "./routers/dlsite.js"
import { github } from "./routers/github.js"
import { kemono } from "./routers/kemono.js"
import { cospuri } from "./routers/cospuri.js"
import { fellatiojapan } from "./routers/fellatiojapan.js"
import { nhentai } from "./routers/nhentai.js"

const funcs = {
    dlsite,
    github,
    kemono,
    cospuri,
    fellatiojapan,
    nhentai
}

export default {
    async fetch(request) {
        const url = new URL(request.url)
        const path = url.pathname.replace(/^\/+|\/+$/g, "")
        const parts = path.split("/")
        const mode = parts[0]
        const value = decodeURIComponent(parts.slice(1).join("/"))

        if (!mode || !value) {
            return new Response("缺少路径参数", { status: 400 })
        }

        // rss 路由
        const func = funcs[mode]

        if (typeof func === "function") {
            const workerUrl = url.origin
            const rss = await func(value, workerUrl)
            return new Response(rss, {
                headers: {
                    "content-type": "application/rss+xml; charset=utf-8"
                }
            })
        }

        // 未知路径按 raw 处理
        const rawUrl = decodeURIComponent(path)
        const resp = await fetch(rawUrl, {
            headers: {
                "User-Agent": request.headers.get("User-Agent") || "",
                "Accept": request.headers.get("Accept") || "*/*",
                "Accept-Language": request.headers.get("Accept-Language") || "",
                "Referer": rawUrl,
                "Origin": new URL(rawUrl).origin,
            }
        })
        const html = await resp.text()
        return new Response(html, {
            headers: {
                "content-type": "text/plain; charset=utf-8"
            }
        })
    }
}