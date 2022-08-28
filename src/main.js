import { Hack, PostAjax as _PostAjax, window } from '@cuclh/userscript-base';
import * as Layout from '@cuclh/userscript-base/src/layout.js';
import _ from 'lodash';
import './main.scss';
import Form from './form.js';

function PostAjax(url, method, headers = {}, payload, timeout) {
	headers = _.assign(headers, {
		'Content-Type': 'application/json;charset=utf-8',
		'Accept': 'application/json, text/plain, */*',
		'X-CSRF-Token': window.jdy_csrf_token,
		'X-JDY-VER': window.jdy_static.jdy_ver
	});
	return _PostAjax(url, method, headers, payload, timeout);
}

class Record {
	constructor(user, date, location) {
		this.user = user;
		this.date = date;
		this.location = location;
	}

	MakeData() {
		const { user, date, location } = this;
		const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

		let data = {
			"values": {
				// 姓名
				"_widget_1581259263912": {
					"data": user.id,
					"visible": true
				},
				// 学号
				"_widget_1581325409790": {
					"data": user.studentID,
					"visible": true
				},
				// 学院
				"_widget_1581259263911": {
					"data": user.deptName,
					"visible": true
				},
				// 专业
				"_widget_1597408997541": {
					"data": user.major,
					"visible": true
				},
				// 班级
				"_widget_1648264291941": {
					"data": user.class,
					"visible": true
				},
				// 手机号码
				"_widget_1582001600375": {
					// TEL
					"data": user.tel || '',
					"visible": true
				},
				// 填报日期
				"_widget_1581259263910": {
					"data": +date,
					"visible": true
				},
				// 填报确认
				"_widget_1581259263913": {
					"data": `${dateStr}-${user.deptName}-${user.studentID}-${user.name}`,
					"visible": true
				},
				// 目前所在地
				"_widget_1594972479663": {
					"data": location.domestic
						? location.province.indexOf('北京') != -1
							? '北京'
							: '其他省市'
						: '境外',
					"visible": true
				},
				// 定位目前所在地/街道
				"_widget_1594972480348": {
					"data": {
						"province": location.province,
						"city": location.city,
						"district": location.district,
						"detail": location.detail || '',
						"lnglatXY": location.coordinate
					},
					"visible": true
				},
				// 该区域是否为中高风险区
				"_widget_1597408997159": {
					// Is risky area
					"data": "否",
					"visible": true
				},
				// 以上“目前所在地”勾选选项较昨日是否有变化
				"_widget_1595580335402": {
					"data": "否",
					"visible": true
				},
				// 请填写变动信息
				"_widget_1595602792466": {
					"visible": false
				},
				// 驻地变动前详细地址
				"_widget_1598020946197": {
					"visible": false
				},
				// 在京常住地址
				"_widget_1596350939077": {
					"data": location.detail,
					"visible": true
				},
				// 体温（℃）
				"_widget_1597486309838": {
					"data": [
						{
							// 记录日期
							"_widget_1646814426533": {
								"data": +date
							},
							// 体温辅助字段
							"_widget_1646815571409": {
								"data": `${dateStr}-${user.studentID}`
							},
							// 早
							"_widget_1597486309854": {
								"data": "37"
							},
							// 中
							"_widget_1597486309914": {
								"data": "37"
							},
							// 晚
							"_widget_1597486309943": {
								"data": "37"
							}
						}
					],
					"visible": true
				},
				// 是否为密接或确诊
				"_widget_1594974441946": {
					"data": "否",
					"visible": true
				},
				// 请上传疑似或确诊材料，核酸检测报告或医院证明材料。并及时报告学院辅导员。
				"_widget_1640358284019": {
					"visible": false
				},
				// 请尽量详细描述最近14天所到访的地点及乘坐何种交通工具
				"_widget_1640358284045": {
					"visible": false
				},
				// 请尽量详细列举近14天所接触人员名单
				"_widget_1640358284032": {
					"visible": false
				},
				// 隔离状态
				"_widget_1611412944997": {
					"data": "未隔离",
					"visible": true
				},
				// 填写隔离地点详细地址
				"_widget_1611412945031": {
					"visible": false
				},
				// 共同居住人是否有新冠疑似症状、被疾控部门确定为密接人员、近14日内有中高风险险地区旅居史等情况
				"_widget_1647852158272": {
					"data": "否",
					"visible": true
				},
				// 在京居住学生近14日内是否有共同居住人离、返京？
				"_widget_1647852158338": {
					"data": "否",
					"visible": true
				},
				// 学院抄送
				"_widget_1599385089556": {
					"data": [
					],
					"visible": false
				},
				// 学工抄送
				"_widget_1599385089589": {
					"data": [
					],
					"visible": false
				},
				// 特殊岗位
				"_widget_1643251849715": {
					"data": "无",
					"visible": false
				}
			},
			"appId": Hack.app.appId,
			"entryId": Hack.app.entryId,
			"formId": Hack.app.entryId,
			"hasResult": true,
			"dataOpId": "986ec673-3297-4436-88e1-e972bf162ad6",
			"authGroupId": -1
		};
		return data;
	}

	async Post() {
		const data = this.MakeData();
		await PostAjax('/_/data/create', 'POST', {}, JSON.stringify(data));
	}
}

_.assign(Hack, {
	header: '简道云批量打卡',

	async Init() {
		const app = this.app = JSON.parse(await PostAjax(location.href.replace('dashboard#', '_'), 'POST', {})).entry;

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
					entryId: '5f103ddb6eac3f0006eaf6cc',
					field: '_widget_1594946538397',
					method: 'eq',
					type: 'text',
					value: [user.studentID]
				}],
				rel: 'and'
			},
			formId: '5f103ddb6eac3f0006eaf6cc'
		}))).data;

		user.major = link['_widget_1594946538290'];
		user.class = link['_widget_1597647893490'];
	},
});

(async () => {
	await Hack.Run();
	Hack.panel.Layout([
		new Layout.Control(Hack.form.ToDOM()),
		new Layout.Button('创建打卡记录', async function() {
			const record = new Record(
				Hack.user,
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
			console.log(record.MakeData());
		})
	]);
})();

console.log(Hack);
