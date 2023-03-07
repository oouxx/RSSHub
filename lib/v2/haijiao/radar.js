module.exports = {
    'haijiao.com': {
        _name: '海角社区',
        '.': [
            {
                title: '热门',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-re-men',
                source: ['/'],
                target: '/haijiao/hot',
            },
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-xin-wen',
                source: ['/'],
                target: '/haijiao/news',
            },
            {
                title: '大事记',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-da-shi-ji',
                source: ['/article', '/'],
                target: '/haijiao/event',
            },
            {
                title: '原创',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-da-yuan-chuang',
                source: ['/'],
                target: '/haijiao/original',
            },
            {
                title: '精华',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-da-jing-hua',
                source: ['/'],
                target: '/haijiao/top',
            },
            {
                title: '公告',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-da-gong-gao',
                source: ['/'],
                target: '/haijiao/notice',
            },
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-da-zui-xin',
                source: ['/'],
                target: '/haijiao/latest',
            },
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-da-wen-zhang',
                source: ['/article', '/'],
                target: (params, url) => `/haijiao/${new URL(url).searchParams.get('nodeId')}`,
            },
        ],
    },
};
