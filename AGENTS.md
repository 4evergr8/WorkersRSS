# AGENTS.md - WorkersRSS 项目智能代理指南 🤖

欢迎来到 **WorkersRSS** 的 AGENTS 文档！  
这里记录了项目中已实现的「路由代理」（routers）和「内容解析代理」（parsers），以及如何为新平台/站点快速创建新的 Agent。

WorkersRSS 的核心设计理念就是：**让 AI（ChatGPT/Claude/Gemini 等）成为你的解析代码生成器**。  
你几乎不需要自己写复杂的爬虫逻辑，只需提供目标网站的 URL + 一点示例代码，AI 就能帮你生成 80% 可用的解析 Agent。

## 当前支持的 Agents（路由 & 解析器） 📡

这些是项目中已经内置的平台代理（位于 `routers/` 目录下）：

| 路由参数     | 平台/站点          | 示例用法                                      | 解析方式     | 备注                              |
|--------------|---------------------|-----------------------------------------------|--------------|-----------------------------------|
| `github`     | GitHub 仓库更新    | `?github=用户名/仓库名`                       | API          | 支持 releases / commits / issues |
| `dlsite`     | DLsite 新作/作品   | `?dlsite=RJ123456`   | HTML / API   | 日文成人游戏/音声                 |
| `kemono`     | Kemono / Fanbox    | `?kemono=fanbox/user/3316400`                 | API          | Patreon / Fanbox 创作者内容      |
| `cospuri`    | Cospuri 模特更新   | `?cospuri=ria-kurumi`                         | HTML         | 日本 cosplay 写真站              |
| `javbus`     | Javbus 演员/作品   | `?javbus=vbt`        | HTML         | 成人影片数据库                    |
| `nhentai`    | Nhentai 标签/搜索  | `?nhentai=chinese`  | API / HTML   | 同人本中文标签搜索                |
| `raw`        | 任意网页通用抓取   | `?raw=https://example.com/page`               | 自定义       | 测试 + AI 生成专用               |

**注意**：  
- 以上 Agents 均已实现并经过作者测试可用。  
- `raw` 不是最终路由，而是开发/扩展时的「调试代理」。

## 如何为新平台创建 Agent（3 步走） 🚀

1. **先用 raw 参数测试可达性**  
   访问：  
   ```
   https://你的workers域名/?raw=https://目标网站/页面或API
   ```  
   - 如果返回正常 HTML/JSON → 继续  
   - 如果 403/429/Cloudflare 拦截 → 该站大概率不支持（放弃或找反代）

2. **准备 Prompt 丢给 AI**  
   复制下面这个模板（或直接用 README 里的作者碎碎念），替换成你的目标：

   ```
   我有一个基于 Cloudflare Workers 的 RSS 生成项目：https://github.com/4evergr8/WorkersRSS

   请帮我写一个新的路由解析函数，类似于 routers/kemono.js 或 routers/dlsite.js。

   目标网站：https://目标站.com
   目标页面示例：https://目标站.com/user/xxxx 或 https://api.target.com/v1/posts?user=123

   需求：
   - 从页面或 API 中提取：标题、链接、描述、发布时间、作者、图片（enclosure 或 media:content）、分类等
   - 输出标准 RSS 2.0 格式的 item 数组
   - 使用 cheerio 解析 HTML（如果不是 API）
   - 错误处理要友好，返回空数组而不是抛异常
   - 代码风格保持一致：async function parseXXX(url) { ... return items }

   请直接给出完整可用的 JavaScript 代码块，我会放到 routers/xxx.js 里。
   ```

3. **集成到项目**  
   - 把 AI 生成的代码保存为 `routers/新平台名.js`  
   - 在 `main.js` 或路由表中添加对应 case：  
     ```js
     case '新平台':
       items = await parse新平台(query);
       break;
     ```  
   - 重新 `wrangler deploy` 部署即可生效！

## 推荐的 AI Prompt 增强技巧 ✨

- 附上已有文件示例：把 `routers/nhentai.js` 或 `routers/github.js` 内容一起贴给 AI，说「风格保持一致」
- 指定输出字段：`必须包含 title, link, pubDate, description, enclosure { url, type }`
- 要求容错：`如果解析失败，返回 [] 而不是 throw error`
- 多给几个示例页面：提供 2-3 个不同类型的 URL，让 AI 写更鲁棒的逻辑

## 常见问题 & 避坑指南 ⚠️

- **反爬严重** → Pixiv、JavDB 等基本无解，放弃为妙
- **API 需要 key** → 如果要 token，建议在环境变量里加 AUTH_KEY，然后在解析函数里读取 `env.AUTH_KEY`
- **图片不显示** → enclosure type 写 `image/jpeg` 或 `image/png`，url 必须是直链
- **发布时间乱码** → 统一转成 ISO 8601 格式：`new Date().toISOString()`
- **Workers 超时** → 单个请求控制在 10s 内，节点太多时建议分页或缓存


