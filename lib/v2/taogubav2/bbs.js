const cheerio = require('cheerio');
const got = require('@/utils/got');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const url = `https://www.taoguba.com.cn/bbs/1/1`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.p_list01').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            let time = $('.pcdj06').text();
            time = new Date(new Date(time).toLocaleString('zh', { timeZone: 'Asia/Shanghai' }));
            const title = $('.pcdj02 a').attr('title');
            const partial = $('.pcdj02 a').attr('href');
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
                pubDate: date(time, +8),
                description: contents,
                link: address,
                guid: address,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '淘股吧股票淘股论坛',
        link: url,
        item: out,
    };
};
