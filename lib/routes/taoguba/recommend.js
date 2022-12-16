const got = require('@/utils/got');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const res = await got({
        method: 'get',
        url: 'https://www.taoguba.com.cn/newIndex/getNowRecommend?pageNo=1',
        searchParams: queryString.stringify({
            pageNo: '1',
        }),
    });
    const data = res.data.dto.list;

    ctx.state.data = {
        title: `今日推荐 - 淘股吧`,
        link: `https://www.taoguba.com.cn/newIndex/1`,
        description: `淘股吧今日推荐`,
        item: data.map((item) => {
            const body = item.subinfo;
            const topicId = item.topicID;
            return {
                title: item.subject ? item.subject : item.subinfo.replace(/<[^>]+>/g, ''),
                description: body,
                pubDate: new Date(item.dateTime).toUTCString(),
                link: `https://www.taoguba.com.cn/Article/${topicId}/1`,
                author: ``,
            };
        }),
    };
};
