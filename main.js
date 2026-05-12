import { dlsite } from "./routers/dlsite.js"
import { github } from "./routers/github.js"
import { kemono } from "./routers/kemono.js"
import { cospuri } from "./routers/cospuri.js"
import { fellatiojapan } from "./routers/fellatiojapan.js"
import { nhentai } from "./routers/nhentai.js"
import { raw } from "./routers/raw.js"     // 新增

const funcs = {
    dlsite,
    github,
    kemono,
    cospuri,
    fellatiojapan,
    nhentai,
    raw                                      // 新增
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

        // rss / raw 路由
        const func = funcs[mode]

        if (typeof func === "function") {
            const workerUrl = url.origin
            const result = await func(value, workerUrl, request)   // 传入原始 request 用于透传 headers
            return result
        }

        return new Response("未知路由", { status: 404 })
    }
}