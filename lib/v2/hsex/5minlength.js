const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://hsex.icu/5min_list-1.htm';
const base = 'https://hsex.icu';

module.exports = async (ctx) => {
    const response = await got(host);
    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const elems = $('.thumbnail').get();
    const items = await Promise.all(
        elems
            .filter(
                () =>
                    // item = cheerio.load(item);
                    // const partial = item('a').attr('href');
                    // if (partial.includes('http')) {
                    //     return false;
                    // }
                    true
            )
            .map((filteredItem) => {
                filteredItem = cheerio.load(filteredItem);
                const partial = filteredItem('a').attr('href');
                const link = base + '/' + partial;
                const img = filteredItem('.image').attr('style');
                const imgUrl = img.split("'")[1];
                const title = filteredItem('.image').attr('title');
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
        title: '好色tv monthly',
        link: base,
        item: items,
    };
};
