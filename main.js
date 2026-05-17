import { dlsite } from "./routers/dlsite.js"
import { github } from "./routers/github.js"
import { nhentai } from "./routers/nhentai.js"
import { raw } from "./routers/raw.js"

const funcs = {
    dlsite,
    github,
    nhentai,
    raw
}

export default {
    async fetch(request) {
        const url = new URL(request.url)
        const params = url.searchParams

        let mode = null
        let value = null

        for (const key of Object.keys(funcs)) {
            if (params.has(key)) {
                mode = key
                value = params.get(key)
                break
            }
        }

        if (!mode || !value) {
            return new Response("缺少参数", { status: 400 })
        }

        const func = funcs[mode]

        if (typeof func === "function") {
            const workerUrl = url.origin

            try {
                const result = await func(value, workerUrl, request)

                if (result instanceof Response) {
                    return result
                }

                if (typeof result === "string") {
                    return new Response(result, {
                        headers: {
                            "content-type": "application/xml; charset=utf-8"
                        }
                    })
                }

                return new Response("子函数返回类型错误", { status: 500 })

            } catch (err) {
                return new Response(String(err?.stack || err), {
                    status: 500,
                    headers: {
                        "content-type": "text/plain; charset=utf-8"
                    }
                })
            }
        }

        return new Response("未知路由", { status: 404 })
    }
}