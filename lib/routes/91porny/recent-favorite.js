const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://91porny.com/video/category/recent-favorite';
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
                return Promise.resolve();
            }
            const link = base + partial + "?server=line1";
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(link);
            const get = cheerio.load(res.data);
            const content = get('#video-play_html5_api').html()
            const single = {
                title: $('a').text(),
                description: content,
                link: link,
                guid: link,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);            
        }
    ));
    // const items = await generateItems(elems, $);

    ctx.state.data = {
        title: '91porny recent-favorite',
        link: 'https://91porny.com',
        item: items,
    };
};
