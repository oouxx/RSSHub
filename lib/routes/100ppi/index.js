
const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://m1.100ppi.com`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.ncon_item').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('.shl-time').text();
            const title = $('.shl-ptit').text();
            const partial = $('.ncon_item').attr('onclick').split("=");
			const article = partial[1].replace("'", "").replace(";", "");
            const address = `https://m1.100ppi.com${article}`;
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const get = cheerio.load(res.data);
            const contents = get('.hqwencon').html();
            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                description: contents,
                link: address,
                guid: address,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '生意社移动端首页',
        link: url,
        item: out,
    };
};
