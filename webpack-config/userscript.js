import WebpackUserscript from 'webpack-userscript';

export default new WebpackUserscript({
	headers: {
		name: '简道云打卡',
		version: '0.0.2',
		grant: ['unsafeWindow'],
		include: 'https://www.jiandaoyun.com/dashboard'
	},
	downloadBaseUrl: 'https://github.com/CUC-Life-Hack/jdy-checkin/raw/master/dist/main.user.js',
	metajs: false,
	renameExt: true,
	pretty: true,
});
