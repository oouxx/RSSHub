const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://91porny.com/video/category/latest';
const base = 'https://91porny.com';

module.exports = async (ctx) => {
    const response = await got(host);
    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const elems = $('.video-elem').get();
    const items = await Promise.all(
        elems
            .filter((item) => {
                item = cheerio.load(item);
                const partial = item('a').attr('href');
                if (partial.includes('http')) {
                    return false;
                }
                return true;
            })
            .map((filteredItem) => {
                filteredItem = cheerio.load(filteredItem);
                const partial = filteredItem('a').attr('href');
                const link = base + partial + '?server=line1';
                const img = filteredItem('.img').attr('style');
                const imgUrl = img.split("'")[1];
                const title = filteredItem('.img').attr('title');
                const single = {
                    title,
                    pubDate: new Date().toUTCString(),
                    description: `<img src="${imgUrl}" alt="${title}">`,
                    link: link.replace('view', 'embed'),
                    guid: link,
                };
                return single;
            })
    );
    ctx.state.data = {
        title: '91porny 91最近更新',
        link: 'https://91porny.com',
        item: items,
    };
};
