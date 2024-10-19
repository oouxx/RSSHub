import { Route } from '@/types';
import got from '@/utils/got';
import * as cheerio from 'cheerio'
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';


export const route: Route = {
    path: '/community/',
    categories: ['finance'],
    example: 'jiuyangongshev2/community',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '社群文章',
    maintainers: ['oouxx'],
    handler,
};

async function handler(ctx) {
    const res = await got(`https://www.jiuyangongshe.com`);
    const data = res.data;
    const context = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const community_bar_data: string | null  = context('div .community-bar').html();
    const community_bar = cheerio.load(community_bar_data!);
    const acticle_list = community_bar('ul').find('li').get();
    let out = [] as any []
    await Promise.all(
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
                let time: string | null = detail('div.date').html();
                const single = {
                    title,
                    pubDate: timezone(parseDate(time!), +8),
                    description: contents,
                    link: address,
                    guid: address,
                };
                out.push(single)
                return
            })
    );

    return {
        title: `韭研公社---社群`,
        link: `https://jiuyangongshe.com/`,
        description: `韭研公社`,
        item: out,
        allowEmpty: true,
    };
}
