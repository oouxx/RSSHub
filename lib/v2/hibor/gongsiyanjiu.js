const cheerio = require('cheerio');
const got = require('@/utils/got');
const BASE = 'http://m.hibor.com.cn';
module.exports = async (ctx) => {
	const url = 'http://m.hibor.com.cn/DocList?docType=1';
	const res = await got.get(url);
	const $ = cheerio.load(res.data);
	const list = $('h3').get();
	const out  = await Promise.all(
		list.map(async (item) => {
			const $ = cheerio.load(item);
			const title = $('a').text();
			const detailPath = $('a').attr('href');
			const detailUrl = BASE + detailPath;
			const detailRes = await got.get(detailUrl);
			const detail = cheerio.load(detailRes.data);
			const content = detail('.doc-content').text();
			const single = {
				title,
				pubDate: new Date(),
				description: content,
				link: detailUrl,
				address: detailUrl,
			}
			return single;
		})
	);
    ctx.state.data = {
        title: '公司研究-慧博',
        link: url,
        item: out,
    };
};
