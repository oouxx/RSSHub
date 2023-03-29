const got = require('@/utils/got');

const date = require('@/utils/date');
const cheerio = require('cheerio');
module.exports = async (ctx) => {
    const res = await got(`https://www.jiuyangongshe.com`);
    const data = res.data;
    const context = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const community_bar_data = context('div .community-bar').html();
    const community_bar = cheerio.load(community_bar_data);
    const acticle_list = community_bar('ul').find('li').get();

    const out = await Promise.all(
        acticle_list
            .filter((item) => {
                const $ = cheerio.load(item);
                const article_id = $('div .drvi').find('a').attr('href');
                if (article_id === undefined) {
                    return false;
                }
                return true;
            })
            .map(async (item) => {
                const $ = cheerio.load(item);
                const title = $('.book-title').first().text();
                const article_id = $('div .drvi').find('a').attr('href');
                const address = `https://www.jiuyangongshe.com${article_id}`;
                const article_detail = await got.get(address);
                const detail = cheerio.load(article_detail.data);
                const contents = detail('div.text-box.text-justify.fsDetail').html();
                let time = detail('div.date').html();
                time = new Date(time);
                const year = time.getFullYear(),
                    month = time.getMonth() + 1, // 月份是从0开始 , 所以+1
                    day = time.getDate(),
                    hour = time.getHours() + 8,
                    min = time.getMinutes(),
                    sec = time.getSeconds();

                const formatedTime = `${year}-${month}-${day} ${hour}:${min}:${sec}`;
                const single = {
                    title,
                    pubDate: date(formatedTime, +8),
                    description: contents,
                    link: address,
                    guid: address,
                };
                return single;
            })
    );

    ctx.state.data = {
        title: `韭研公社---社群`,
        link: `https://jiuyangongshe.com/`,
        description: `韭研公社`,
        item: out,
    };
};
