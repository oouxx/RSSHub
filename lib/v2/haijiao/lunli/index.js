const got = require('@/utils/got');
const URL = `https://haijiao.com/api/topic/node/topics?page=1&nodeId=1288&type=1&limit=50`;
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: URL,
    });
    let data = Buffer.from(response.data.data, 'base64').toString();
    data = Buffer.from(data, 'base64').toString();
    data = Buffer.from(data, 'base64').toString();
    data = JSON.parse(data);
    const results = data.results;

    const out = await Promise.all(
        results.map(async (item) => {
            const topicId = item.topicId;
            const title = item.title;
            const address = `https://haijiao.com/api/topic/${topicId}`;
            const response = await got.get(address);
            let data = Buffer.from(response.data.data, 'base64').toString();
            data = Buffer.from(data, 'base64').toString();
            data = Buffer.from(data, 'base64').toString();
            data = JSON.parse(data);
            const description = data.content;

            const single = {
                title,
                pubDate: new Date().toUTCString,
                description,
                link: address,
                guid: address,
            };
            return single;
        })
    );

    ctx.state.data = {
        title: `海角社区---伦理之爱（最新）`,
        link: `https://jiuyangongshe.com/`,
        description: `海角社区`,
        item: out,
    };
};
