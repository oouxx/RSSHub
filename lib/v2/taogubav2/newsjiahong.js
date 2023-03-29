const got = require('@/utils/got');
const queryString = require('query-string');
const date = require('@/utils/date');
module.exports = async (ctx) => {
    const res = await got({
        method: 'get',
        url: 'https://shuo.taoguba.com.cn/newsFlash/getAllNewsFlash',
        searchParams: queryString.stringify({
            type: 'A',
            pageNo: '1',
        }),
        headers: {
            Referer: `https://shuo.taoguba.com.cn/newsFlash/`,
        },
    });
    const data = res.data.dto.list;

    ctx.state.data = {
        title: `加红 - 淘股吧极速资讯`,
        link: `https://shuo.taoguba.com.cn/newsFlash/`,
        description: `淘股吧极速加红资讯`,
        item: data.map((item) => {
            const body = item.body;
            return {
                title: item.subject ? item.subject : item.summary.replace(/<[^>]+>/g, ''),
                description: body,
                pubDate: date(item.dateTime, +8),
                link: ``,
                author: ``,
            };
        }),
    };
};
