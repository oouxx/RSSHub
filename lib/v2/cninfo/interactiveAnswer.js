const got = require('@/utils/got');

module.exports = async (ctx) => {
    const searchKey = ctx.params.search || ''; //  标题关键字
	const now = new Date();
	now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai'});
	const timestamp = now.getTime();

    const url = `http://irm.cninfo.com.cn`;
    const apiUrl = `http://irm.cninfo.com.cn/newircs/index/search?_t=${timestamp}`;
    const response = await got.post(apiUrl, {
        headers: {
            Referer: url,
        },
        form: {
            pageSize: 100,
            pageNo: 1,
			searchTypes: 11, // 11 已回复 1 未回复
			keyWord: searchKey,
            isHLtitle: true,
        },
    });
    const resultsList = response.data.results;

    const out = resultsList.map((item) => {
        let title = item.mainContent;
        const date = item.packageDate;
		const questionId = item.indexId;
		const description = item.attachedContent;
        const link = 'http://irm.cninfo.com.cn/ircs/question/questionDetail?' + `questionId=${questionId}`;
        const name = item.attachedAuthor;
        title = `(${name})---` + title

        const single = {
            title,
			description,
            link,
			author: name,
            pubDate: new Date(date).toUTCString(),
        };

        return single;
    });
    ctx.state.data = {
        title: `互动-巨潮资讯`,
        link: url,
        item: out,
    };
};
