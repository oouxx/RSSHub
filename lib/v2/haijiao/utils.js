const got = require('@/utils/got');
const cheerio = require('cheerio');
const asyncPool = require('tiny-async-pool');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://www.haijiao.com';

const decodeImage = (text) => {
    const e = 'ABCD*EFGHIJKLMNOPQRSTUVWX#YZabcdefghijklmnopqrstuvwxyz1234567890';

    let a,
        o,
        i,
        r,
        c,
        s,
        u = '',
        image = '',
        index = 0;

    text = text.replace(/[^A-Za-z0-9*#]/g, '');

    while (index < text.length) {
        r = e.indexOf(text.charAt(index++));
        c = e.indexOf(text.charAt(index++));
        s = e.indexOf(text.charAt(index++));
        u = e.indexOf(text.charAt(index++));
        a = (r << 2) | (c >> 4);
        o = ((15 & c) << 4) | (s >> 2);
        i = ((3 & s) << 6) | u;
        image += String.fromCharCode(a);
        64 !== s && (image += String.fromCharCode(o));
        64 !== u && (image += String.fromCharCode(i));
    }

    return image;
};

const decodeJsonData = (text) =>{
    let data = Buffer.from(text, 'base64').toString();
    data = Buffer.from(data, 'base64').toString();
    data = Buffer.from(data, 'base64').toString();
    data = JSON.parse(data);
    return data
}

module.exports = {
    rootUrl,
    DecodeJsonData: decodeJsonData,
    ProcessItems: async (apiUrl, limit, tryGet) => {
        const response = await got({
            method: 'get',
            url: apiUrl,
        });
        data = decodeJsonData(response.data.data)

        const list = data.results.slice(0, limit ? parseInt(limit) : 20).map((item) => ({
            guid: item.topicId,
            title: item.title,
            link: `${rootUrl}/post/details?pid=${item.topicId}`,
            category: item.node?.name ?? [],
            author: item.user.nickname,
            pubDate: timezone(parseDate(item.createTime), +8),
            description: item.liteContent ? `<p>${item.liteContent}</p>` : '',
        }));

        const items = [];
        for await (const item of asyncPool(5, list, (item) =>
            tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/api/topic/${item.guid}`,
                });
                data = decodeJsonData(detailResponse.data.data)

                const content = cheerio.load(data.content);

                content('.sell-btn').remove();

                const attachments = data.attachments ?? [];

                for await (const attachment of asyncPool(5, attachments, (attachment) =>
                    tryGet(attachment.remoteUrl, async () => {
                        const attachmentResponse = await got({
                            method: 'get',
                            url: attachment.coverUrl ?? attachment.remoteUrl,
                        });

                        attachment.data = decodeImage(attachmentResponse.data);

                        return attachment;
                    })
                )) {
                    if (content(`[data-id="${attachment.id}"]`).length === 0) {
                        content('body').append(
                            art(path.join(__dirname, 'templates/attachment.art'), {
                                attachment,
                            })
                        );
                    } else {
                        content(`[data-id="${attachment.id}"]`).replaceWith(
                            art(path.join(__dirname, 'templates/attachment.art'), {
                                attachment,
                            })
                        );
                    }
                }

                item.description = content('body').html();

                return item;
            })
        )) {
            items.push(item);
        }

        return items;
    },
};
