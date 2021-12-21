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
                return Promise.resolve({});
            }
            const link = base + partial + '?server=line1';
            const img = $('.img').attr('style');
            const imgUrl = img.split("'").at(1);
            const title = $('.img').attr('title');

            const single = {
                title,
                pubDate: new Date().toUTCString(),
                description: `<img src="${imgUrl}" alt="${title}">`,
                link,
                guid: link,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '91porny 91最近最爱',
        link: 'https://91porny.com',
        item: items,
    };
};
