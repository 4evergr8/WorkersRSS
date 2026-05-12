export async function raw(value, workerUrl, request) {
    let targetUrlStr = value

    if (!targetUrlStr.startsWith("http://") && !targetUrlStr.startsWith("https://")) {
        targetUrlStr = "https://" + targetUrlStr
    }

    const targetUrl = new URL(targetUrlStr)

    // 使用 clone 方式处理 body（更安全）
    let body = null
    if (request.method !== "GET" && request.method !== "HEAD") {
        body = await request.clone().arrayBuffer()
    }

    const fetchRequest = new Request(targetUrl.href, {
        method: request.method,
        headers: {
            "User-Agent": request.headers.get("User-Agent") || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": request.headers.get("Accept") || "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": request.headers.get("Accept-Language") || "",
            "Referer": targetUrl.origin,
            "Cookie": request.headers.get("Cookie") || "",
        },
        body: body,
        redirect: "follow",
    })

    const resp = await fetch(fetchRequest)

    const text = await resp.text()

    return new Response(text, {
        status: resp.status,
        statusText: resp.statusText,
        headers: {
            "content-type": "text/plain; charset=utf-8",
            "Access-Control-Allow-Origin": "*"
        }
    })
}