const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
module.exports = async (ctx) => {
    const dateParam = ctx.params.date;
    const now = new Date(new Date().toLocaleString('zh', { timeZone: 'Asia/Shanghai' }));
    const time = now.toLocaleString('zh', { timeZone: 'Asia/Shanghai' });
    const nowDate = now.getDate();
    const month = now.getMonth() + 1;
    const fullYear = now.getFullYear();

    const url = 'https://app.jiuyangongshe.com/jystock-app/api/v1/action/field';
    const res = await got.post(url, {
        json: {
            date: dateParam ? dateParam : `${fullYear}-${month}-${nowDate}`,
            pc: 1,
        },
        headers: {
            token: 'token',
            timestamp: Date.now(),
            platform: 3,
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            dnt: 1,
            authority: 'app.jiuyangongshe.com'

        }
    });
    const date = dateParam ? dateParam : `${fullYear}-${month}-${nowDate}`;
    const title = `韭研公社异动解析${date}`;

    const data = res.data.data;

    const stockList = new Array();
    for (let i = 1; i < data.length; i++) {
        stockList[i - 1] = new Array();
        stockList[i - 1][0] = {"reason": data[i].reason ? data[i].reason : ''};
        for (let j = 1; j < data[i].list.length + 1; j++) {
            const name = data[i].list[j - 1].name;
            const code = data[i].list[j - 1].code;
            const action_info = data[i].list[j - 1].article.action_info;
            stockList[i - 1][j] = {
                "name": name + ' ' + code,
                "price": action_info.price / 100,
                "shares_range": action_info.shares_range / 100 + '%',
                "time": action_info.time,
                "expound": action_info.expound,
            };
        }
    }

    const address = `https://jiuyangongshe.com/action`;
    const single = {
        title,
        pubDate: time,
        description: art(path.join(__dirname, 'templates/list.art'),
            {
                list: stockList,
                title,
            }
        ),
        link: address,
        guid: address,
    };

    ctx.state.data = {
        title: `韭研公社---异动`,
        link: `https://jiuyangongshe.com/action`,
        description: `韭研公社`,
        item: new Array(single),
    };
};
