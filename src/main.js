import * as HackBase from '@cuclh/userscript-base';
import * as Layout from '@cuclh/userscript-base/src/layout.js';
import _ from 'lodash';
import './main.scss';
import Form from './form.js';

function PostAjax(url, method, headers = {}, payload, timeout) {
	headers = _.assign(headers, {
		'Content-Type': 'application/json;charset=utf-8',
		'Accept': 'application/json, text/plain, */*',
		'X-CSRF-Token': HackBase.window.jdy_csrf_token,
		'X-JDY-VER': HackBase.window.jdy_static.jdy_ver
	});
	return HackBase.PostAjax(url, method, headers, payload, timeout);
}

class Hack extends HackBase.Hack {
	constructor() {
		super();
		this.header = '简道云打卡';
		this.TryInit().then(() => {
			this.panel.Layout([
				new Layout.Control(this.form.ToDOM()),
				new Layout.Button('创建打卡记录', async function() {
					const record = new Record(
						this.user,
						new Date(),
						{
							domestic: true,
							province: '北京',
							city: '北京市',
							district: '东城区',
							detail: '',
							coordinate: [116.38, 39.9]
						}
					);
					console.log(record.MakeData(hack));
				})
			]);
		});
	}

	async Init() {
		const app = this.app = JSON.parse(await PostAjax(location.href.replace('dashboard#', '_'), 'POST', {})).entry;
		app.formID = '5f103ddb6eac3f0006eaf6cc';

		const info = JSON.parse(await PostAjax('/corp/login_user_info', 'POST', {}, '{}'));
		const member = info.memberInfo;
		const dept = member.dept[0];

		const user = this.user = {
			id: member.member_id,
			name: member.nickname,
			studentID: member.username,
			deptName: dept.name
		};

		const items = this.items = JSON.parse(await PostAjax(`/_/app/${app.appId}/form/${app.entryId}`, 'POST')).entry.content.items;
		this.form = await Form.FromItems(items);

		const link = JSON.parse(await PostAjax('/_/data/link', 'POST', {}, JSON.stringify({
			appId: app.appId,
			entryId: app.entryId,
			fields: [
				'_widget_1596080259542',
				'_widget_1594946538290',
				'_widget_1597647893490',
				'_widget_1594946538169'
			],
			filter: {
				cond: [{
					entryId: this.app.formID,
					field: '_widget_1594946538397',
					method: 'eq',
					type: 'text',
					value: [user.studentID]
				}],
				rel: 'and'
			},
			formId: this.app.formID
		}))).data;

		user.major = link['_widget_1594946538290'];
		user.class = link['_widget_1597647893490'];
	}
}

HackBase.window.hack = new Hack();
