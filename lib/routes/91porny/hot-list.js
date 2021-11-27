const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://jiuse88.com/video/category/hot-list';
const base = 'https://jiuse88.com';

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
            const link = base + partial + "?server=line1";
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(link);
            const get = cheerio.load(res.data);
            const imgUrl = get('#video-play').attr('data-poster');
            const title = get('h4').text();
            const pubDate = new Date().toUTCString();
            const single = {
                title,
                pubDate: pubDate,
                description: imgTag(imgUrl),
                link: link,
                guid: link,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);            
        }
    ));

    ctx.state.data = {
        title: '91porny hot-list',
        link: 'https://91porny.com',
        item: items,
    };
};


const imgTag = (link) =>
    `<img src=${link} />`;

