const cheerio = require('cheerio');
const got = require('@/utils/got');
const queryString = require('query-string');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const url = `https://www.taoguba.com.cn/newIndex/getStockResearch`;

    const res = await got.get({
        method: 'get',
        url,
        searchParams: queryString.stringify({
            pageNo: '1',
            type: '4',
            sxType: '1',
        }),
    });
    const data = res.data.dto.list;

    const out = await Promise.all(
        data.map(async (item) => {
            const topicId = item.topicID;
            const title = item.subject;
            const time = item.postDate;
            const address = `https://www.taoguba.com.cn/Article/${topicId}/1`;
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
        title: '淘股吧个股研究方法论',
        link: url,
        item: out,
    };
};
