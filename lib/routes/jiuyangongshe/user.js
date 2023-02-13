const got = require('@/utils/got');

const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const res = await got(`https://www.jiuyangongshe.com/u/${ctx.params.uid}`);
    const data = res.data;
    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const name = $('.jc-user-name').find('div .name').text();
    const title = $('.book-title').first().text();
    const article_id = $('div .drvi').find('a').attr('href');
    const address = `https://www.jiuyangongshe.com${article_id}`;
    const article_detail = await got.get(address);
    const detail = cheerio.load(article_detail.data);
    const contents = detail('div.text-box.text-justify.fsDetail').html();
    const out = {
        title,
        pubDate: new Date().toUTCString(),
        description: contents,
        link: address,
        guid: address,
    };

    ctx.state.data = {
        title: `韭研公社---${name}`,
        link: `https://jiuyangongshe.com/`,
        description: `韭研公社`,
        item: new Array(out),
    };
};
