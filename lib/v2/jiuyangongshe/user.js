const got = require('@/utils/got');
const date = require('@/utils/date');

const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const res = await got(`https://www.jiuyangongshe.com/u/${ctx.params.uid}`);
    const data = res.data;
    const context = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const name = context('.jc-user-name').find('div .name').text();
    const community_bar_data = context('div .community-bar').html();
    const community_bar = cheerio.load(community_bar_data);
    const acticle_list = community_bar('ul').find('li').get();

    const out = await Promise.all(
        acticle_list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.book-title').first().text();
            const article_id = $('div .drvi').find('a').attr('href');
            const address = `https://www.jiuyangongshe.com${article_id}`;
            const article_detail = await got.get(address);
            const detail = cheerio.load(article_detail.data);
            const contents = detail('div.text-box.text-justify.fsDetail').html();
            const time = detail('div.date').html();
            const single = {
                title,
                pubDate: date(time, +8),
                description: contents,
                link: address,
                guid: address,
            };
            return single;
        })
    );

    ctx.state.data = {
        title: `韭研公社---${name}`,
        link: `https://jiuyangongshe.com/`,
        description: `韭研公社`,
        item: out,
    };
};
