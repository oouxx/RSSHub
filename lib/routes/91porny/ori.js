const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://91porny.com/video/category/ori';
const base = 'https://91porny.com';

module.exports = async (ctx) => {
    const response = await got(host);
    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const elems = $('.video-elem').get();
    const items = await Promise.all(
        elems.map(async (item) => {
            const $ = cheerio.load(item);
            // 默认使用line1
            const partial = $('a').attr('href');
            if (partial.includes('http')) {
                return Promise.resolve({});
            }
            const link = base + partial + '?server';
            const img = $('.img').attr('style');
            const imgUrl = img.split("'")[1];
            const title = $('.img').attr('title');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(link);
            const get = cheerio.load(res.data);
            const m3u8Url = get('#video-play_html5_api').attr('data-src');
            const single = {
                title,
                pubDate: new Date().toUTCString(),
                description: `<img src="${imgUrl}" alt="${title}">`,
                link,
                guid: m3u8Url,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '91porny 91原创',
        link: 'https://91porny.com',
        item: items,
    };
};
