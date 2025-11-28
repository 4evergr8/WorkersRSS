# 🌐 RSSWorker

**RSSWorker** 是一个基于 Cloudflare Worker 的 RSS 生成工具。它通过访问网页或调用 API，将内容转换为标准 RSS，可自部署使用。

## ⚙️ 功能原理
- 🌍 访问网页或调用各平台 API
- 📝 解析内容（文字、图片、链接等）
- 📡 生成 RSS feed

## 💻 支持的平台
- **GitHub**  
  示例链接: [https://rss.4evergr8.workers.dev/?github=4evergr8/atoolbox](https://rss.4evergr8.workers.dev/?github=4evergr8/atoolbox)
- **DLsite**  
  示例链接: [https://rss.4evergr8.workers.dev/?dlsite=RG51931](https://rss.4evergr8.workers.dev/?dlsite=RG51931)
- **Kemono**  
  示例链接: [https://rss.4evergr8.workers.dev/?kemono=fanbox/user/3316400](https://rss.4evergr8.workers.dev/?kemono=fanbox/user/3316400)
- **Cospuri**  
  示例链接: [https://rss.4evergr8.workers.dev/?cospuri=ria-kurumi](https://rss.4evergr8.workers.dev/?cospuri=ria-kurumi)
- **Javbus**  
  示例链接: [https://rss.4evergr8.workers.dev/?javbus=vbt](https://rss.4evergr8.workers.dev/?javbus=vbt)
- **Nhentai**  
  示例链接: [https://rss.4evergr8.workers.dev/?nhentai=chinese fullcolor](https://rss.4evergr8.workers.dev/?nhentai=chinese fullcolor)


## ⛔ 已放弃的站点
- [Pixiv](https://www.pixiv.net) 理由：防火墙阻止WorkerIP访问，防爬可过
- [JavDB](https://javdb.com) 理由：防火墙有几率阻止WorkerIP访问，似乎无防爬



## 🚀 自部署
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/4evergr8/WorkerRSS/)

1. 📦 将项目部署到 Cloudflare Worker
2. 🔧 配置访问 URL
3. 📰 使用平台参数生成 RSS
  

我一直认为rss属于那种“不是每天都看，但是偶尔会去确认一下”的内容  
迫于rsshub没有我想要的网站，也没找到可靠的节点，又不想自己花钱买服务器，就整了这个，写到一半发现已经有成熟的实现了😅，只能硬着头皮写完了  
想要添加新网站很简单  
参数raw，值是目标网址，访问一下查看有没有风控，能不能正常加载内容，把网站部分源码和已有的任何一个网站的代码一起提交给Chatgpt，它知道怎么做  
多数网站支持api请求，少数网站只能解析网页  
