const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'all'; //  分类
    const searchKey = ctx.params.search || ''; //  标题关键字
    let plate = 'sz;sh';
	// const now = new Date();
	// now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai'});
	// const day = add0(now.getDate());
	// const month = add0(now.getMonth() + 1);
	// const year = now.getFullYear();

    const url = `http://www.cninfo.com.cn/new/disclosure/stock?stockCode=&orgId=`;
    const apiUrl = `http://www.cninfo.com.cn/new/hisAnnouncement/query`;
    // switch (column) {
    //     case 'szse':
    //         plate = 'sz';
    //         break;
    //     case 'sse':
    //         plate = 'sh';
    //         break;
    //     case 'third':
    //         plate = 'neeq';
    //         break;
    //     case 'hke':
    //         plate = 'hke';
    //         break;
    //     case 'fund':
    //         plate = 'fund';
    //         break;
    // }
    const response = await got.post(apiUrl, {
        headers: {
            Referer: url,
        },
        form: {
			stock: '',
            tabName: 'fulltext',
            pageSize: 30,
            pageNum: 1,
            // column,
            category: category === 'all' ? '' : category,
            plate,
            seDate: '',
            searchkey: searchKey,
            secid: '',
            sortName: '',
            sortType: '',
            isHLtitle: true,
        },
    });
    const announcementsList = response.data.announcements;

    const out = announcementsList.map((item) => {
        const title = item.announcementTitle;
        const date = item.announcementTime;
        const announcementTime = new Date(item.announcementTime).toISOString().slice(0, 10);
        const code = item.secCode;
        const orgId = item.orgId;
        const link = 'http://www.cninfo.com.cn/new/disclosure/detail' + `?plate=${plate}` + `&orgId=${orgId}` + `&stockCode=${code}` + `&announcementId=${item.announcementId}` + `&announcementTime=${announcementTime}`;
        const name = item.secName;

        const single = {
            title,
            link,
            author: name,
            pubDate: new Date(date).toUTCString(),
        };

        return single;
    });
    ctx.state.data = {
        title: `公告-巨潮资讯`,
        link: url,
        item: out,
    };
};

function add0(m) {
    return m < 10 ? '0' + m : m;
}