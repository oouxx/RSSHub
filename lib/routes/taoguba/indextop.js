const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.taoguba.com.cn`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('#default_zonghe').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            // const userName = $('.user-name').text();
            const title = $('.left a').attr('title');
            const partial = $('.left a').attr('href');
			// const zhaiyao = $('.content-zhaiyao').text();
            const address = `https://www.taoguba.com.cn/${partial}`;
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const get = cheerio.load(res.data);
            get('img').each((index, item) => {
                item = get(item);
                item.attr('src', item.attr('data-original'));
                item.removeAttr('onload');
            });
            const contents = get('div#first.p_coten').html();
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
        title: '淘股吧首页TOP20',
        link: url,
        item: out,
    };
};
