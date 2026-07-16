# WorkerRSS 🌐

基于 **Cloudflare Workers** 的轻量 RSS 生成工具  
一键把网站/平台内容转成标准 RSS feed，自部署 RSSHub 替代方案！📡

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-%23F38020?style=flat&logo=cloudflare&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## 项目碎碎念😅

我一直认为 RSS 属于那种「不是每天都看，但是偶尔会去确认一下」的内容。  
结果迫于 RSSHub 没有我想要的网站，也没找到稳定可靠的公共节点，又不想自己花钱买服务器折腾……
## 🔥 功能亮点

- 🌍 访问网页或调用平台 API，轻松抓取内容
- 📝 智能解析文字、图片、链接、发布时间等，转成标准 RSS
- 🔧 添加新网站超简单：丢 URL + 源码给 ChatGPT，它帮你写解析器！
- ⚡ 无需服务器，Cloudflare Workers 免费部署，30 秒上线
- 📡 输出纯正 RSS 2.0 feed，兼容 Feedly、Inoreader、FreshRSS、NetNewsWire 等所有主流阅读器
- 🛡️ 完全自建，避开 RSSHub 节点不稳/缺站/延迟高的痛点
## 🚀 极速部署
<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/4evergr8/WorkersRSS">
    <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers" style="height: 32px;"/>
</a>  


部署后得到你的专属 RSS 地址，例如：

```
https://rss-rss.pages.dev
```

## 🎯 食用方法

基本格式（直接浏览器打开或丢进 RSS 阅读器）：

```
https://rss-rss.pages.dev/?<平台>=<参数>
```

已有路由：

- GitHub 仓库更新：  
  `https://rss-rss.pages.dev/?github=4evergr8/atoolbox`

- DLsite 社团新作：  
  `https://rss-rss.pages.dev/?dlsite=RG51931`

- Nhentai 标签检索：  
  `https://rss-rss.pages.dev/?nhentai=artist/mignon`

- iTunes 歌手专辑：  
  `https://rss-rss.pages.dev/?itunes=473219952`  
  `https://rss-rss.pages.dev/?itunes=lukasgraham`


想抓任意网页？直接用 raw ：

```
https://rss-rss.pages.dev/?raw=https://example.com/some-page
```

（然后让 ChatGPT 帮你写解析规则就行～）

## 注意事项 ⚠️

- 部分站点（如 Pixiv、JavDB）因强防火墙/反爬机制已放弃支持
- Workers 免费额度每天 10 万次请求，个人用绰绰有余
- 添加新平台前，先用 `?raw=` 测试目标站是否能正常抓取

## ❤️ 感谢 & 灵感来源

- Cloudflare Workers 平台
- RSSHub 项目（但我就是不想用公共节点也不想自建服务器😂）
 
