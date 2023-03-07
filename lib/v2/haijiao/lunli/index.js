const got = require('@/utils/got');
const haijiaoencrypt = require('../util');
const Cheerio = require('cheerio');
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
            const detailUrl = `https://haijiao.com/post/details?pid=${topicId}`;
            const response = await got.get(address);
            let data = Buffer.from(response.data.data, 'base64').toString();
            data = Buffer.from(data, 'base64').toString();
            data = Buffer.from(data, 'base64').toString();
            data = JSON.parse(data);
            const encryptedContent = data.content;
            var content = Cheerio.load(encryptedContent);

            if (data.attachments) {

                await Promise.all(
                    data.attachments.map( async (element) => {
                        if (element.status === 1 && element.category === 'images') {
                            const dataId = element.id;
                            const imageRes = await got({
                                method: 'get',
                                url: element.remoteUrl,
                            });
                            if (!imageRes.data) {
                                return;
                            }
                            const image = (new haijiaoencrypt).decode(imageRes.data);
                            content('img').filter(`[data-id="${dataId}"]`).attr('src', image);
                        }
                    }
                ))
            }

            const single = {
                title: title,
                pubDate: new Date().toUTCString,
                description: content.html(),
                link: detailUrl,
                guid: detailUrl,
            };
            return single;
        })
    );

    ctx.state.data = {
        title: `海角社区---伦理之爱（最新）`,
        link: `https://haijiao.com/`,
        description: `海角社区`,
        item: out,
    };
};
