import { dlsite } from "./routers/dlsite.js"
import { github } from "./routers/github.js"
import { nhentai } from "./routers/nhentai.js"
import { itunes } from "./routers/itunes.js";

// 统一的 CORS 响应头配置
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
}

export default {
    async fetch(request) {
        // 1. 处理浏览器的预检请求 (OPTIONS)
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            })
        }

        const url = new URL(request.url)

        // 提取当前 Worker 的自身基础链接 (例如 https://xxx.workers.dev/ 形式)
        const baseUrl = url.origin + url.pathname

        // 【核心修改】将所有参数转为数组，直接解构获取第一组参数和值
        const paramsArray = [...url.searchParams]

        let mode = null
        let value = null

        if (paramsArray.length > 0) {
            // 直接锁定第一组参数：[0][0] 是参数名(mode)，[0][1] 是参数值(value)
            mode = paramsArray[0][0]
            value = paramsArray[0][1]
        }



        // 2. 如果第一组参数是 raw 代理模式，直接在主函数中处理
        if (mode === "raw") {
            let targetUrlStr = value

            if (!targetUrlStr.startsWith("https://")) {
                targetUrlStr = "https://" + targetUrlStr
            }

            const targetUrl = new URL(targetUrlStr)

            let body = null
            if (request.method !== "GET" && request.method !== "HEAD") {
                body = await request.clone().arrayBuffer()
            }

            const fetchRequest = new Request(targetUrl.href, {
                method: request.method,
                headers: request.headers, // 完全套用来访 Header
                body: body,
                redirect: "follow",
            });

            const resp = await fetch(fetchRequest)
            const text = await resp.text()

            return new Response(text, {
                status: resp.status,
                statusText: resp.statusText,
                headers: {
                    "content-type": "text/plain; charset=utf-8",
                    ...corsHeaders
                }
            })
        }


        const funcs = { dlsite, github, nhentai, itunes }
        const func = funcs[mode]

        if (typeof func === "function") {
            // 向子函数多传入一个参数 baseUrl
            const result = await func(value, baseUrl)

            // 正确返回纯文本内容（RSS/XML）
            return new Response(result, {
                headers: {
                    "content-type": "application/xml; charset=utf-8",
                    ...corsHeaders
                }
            })
        }

        return new Response("未知路由", {
            status: 200,
            headers: corsHeaders
        })
    }
}