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

class haijiaoencrypt {
    constructor() {
        var e = "ABCD*EFGHIJKLMNOPQRSTUVWX#YZabcdefghijklmnopqrstuvwxyz1234567890", t = (this.encode = function (i) {
            let a, n, o, r, s, c, l = "", d = 0;
            for (i = t(i); d < i.length;) {
                o = (a = i.charCodeAt(d++)) >> 2,
                r = (3 & a) << 4 | (a = i.charCodeAt(d++)) >> 4,
                s = (15 & a) << 2 | (n = i.charCodeAt(d++)) >> 6,
                c = 63 & n,
                isNaN(a) ? s = c = 64 : isNaN(n) && (c = 64),
                l = l + e.charAt(o) + e.charAt(r) + e.charAt(s) + e.charAt(c);
            }
            return l;
        }
            ,
            this.decode = function (t) {
                let a, n, o, r, s, c, l = "", d = 0;
                for (t = t.replace(/[^A-Za-z0-9\*\#]/g, ""); d < t.length;) {
                    o = e.indexOf(t.charAt(d++)),
                    a = (15 & (r = e.indexOf(t.charAt(d++)))) << 4 | (s = e.indexOf(t.charAt(d++))) >> 2,
                    n = (3 & s) << 6 | (c = e.indexOf(t.charAt(d++))),
                    l += String.fromCharCode(o << 2 | r >> 4),
                    64 != s && (l += String.fromCharCode(a)),
                    64 != c && (l += String.fromCharCode(n));
                }
                return i(l);
            }
            ,
            function (e) {
                e = e.replace(/\r\n/g, "\n");
                for (var t = "", i = 0; i < e.length; i++) {
                    const a = e.charCodeAt(i);
                    a < 128 ? t += String.fromCharCode(a) : t = 127 < a && a < 2048 ? (t += String.fromCharCode(a >> 6 | 192)) + String.fromCharCode(63 & a | 128) : (t = (t += String.fromCharCode(a >> 12 | 224)) + String.fromCharCode(a >> 6 & 63 | 128)) + String.fromCharCode(63 & a | 128);
                }
                return t;
            }
        ), i = function (e) {
            for (var t, i, a = "", n = 0, o = 0; n < e.length;) {
                (t = e.charCodeAt(n)) < 128 ? (a += String.fromCharCode(t),
                    n++) : 191 < t && t < 224 ? (o = e.charCodeAt(n + 1),
                        a += String.fromCharCode((31 & t) << 6 | 63 & o),
                        n += 2) : (o = e.charCodeAt(n + 1),
                            i = e.charCodeAt(n + 2),
                            a += String.fromCharCode((15 & t) << 12 | (63 & o) << 6 | 63 & i),
                            n += 3);
            }
            return a;
        };
    }
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

                        attachment.data = (new haijiaoencrypt).decode(attachmentResponse.data);

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
