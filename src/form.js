import _ from 'lodash';
import './form.scss';

function PadString(str, pad, len) {
	str = str + '';
	pad = pad + '';
	return pad.repeat(Math.max(0, len - str.length)) + str;
}

const DateToString = date => [
	date.getFullYear(),
	date.getMonth() + 1,
	date.getDate()
].map(s => PadString(s, '0', 2)).join('-');

const TimeToString = time => [
	time.getHours(),
	time.getMinutes(),
	time.getSeconds()
].map(s => PadString(s, '0', 2)).join(':');

class Field {
	static async FromItem(form, item) {
		{
			const existing = form.Find(item);
			if(existing)
				return existing;
		}

		const widget = item.widget;
		const field = new Field(form, widget.widgetName);
		field.widget = widget;

		field.needFetch = false;
		field.ready = true;

		field.type = widget.type;
		field.visible = !!widget.visible;
		field.label = item.label;

		return field;
	}

	static domBuilders = new Map(_.toPairs({
		user() {},
		text() {
			const $input = document.createElement('input');
			$input.type = 'text';
			$input.value = this.value;
			$input.addEventListener('change', () => this.value = $input.value);
			return $input;
		},
		datetime() {
			const $p = document.createElement('p');
			const now = new Date(Date.now());

			const $date = document.createElement('input');
			$date.type = 'date';
			$date.value = DateToString(now);

			const $time = document.createElement('input');
			$time.type = 'time';
			$time.value = TimeToString(now);

			[$date, $time].forEach($ => $.addEventListener('input', () =>
				this.value = +new Date($date.value + ' ' + $time.value)
			));

			$p.append($date, $time);
			return $p;
		},
		radiogroup() {
			const $list = document.createElement('ul');
			for(const option of this.widget.items) {
				const $option = document.createElement('li');
				const $radio = document.createElement('input');
				$radio.type = 'radio';
				$radio.name = this.id;
				$radio.value = option.value;
				$radio.addEventListener('input', () => this.value = $radio.value);
				$option.append($radio, option.text);
				$list.append($option);
			}
			return $list;
		},
		location() {},
		address() {
			return Field.domBuilders.get('text').call(this);
		},
		subform() {},
		image() {},
		textarea() {
			return Field.domBuilders.get('text').call(this);
		},
		separator() {
			return document.createElement('hr');
		},
		usergroup() {},
	}));
	
	get Enabled() {
		return this.DOM.classList.contains('enabled');
	}
	set Enabled(value) {
		this.DOM.classList[value ? 'add' : 'remove']('enabled');
	}

	get Visible() {
		return this.DOM.classList.contains('visible');
	}
	set Visible(value) {
		this.DOM.classList[value ? 'add' : 'remove']('visible');
	}

	get DOM() {
		if(this.dom !== null)
			return this.dom;

		this.dom = document.createElement('div');
		this.dom.classList.add('field');
		this.dom.dataset['widgetName'] = this.id;
		
		const $label = document.createElement('h2');
		$label.classList.add('label');
		$label.innerText = this.label;
		this.dom.append($label);

		this.Enabled = true;
		if(!Field.domBuilders.has(this.type)) {
			this.dom.append('尚未实现此类型键值控件');
			this.Enabled = false;
		}
		else {
			const dom = Field.domBuilders.get(this.type).call(this);
			if(dom)
				this.dom.append(dom);
			else {
				this.dom.append('尚未实现此类型键值控件');
				this.Enabled = false;
			}
		}

		this.Enabled = this.Enabled && this.widget.enable;
		this.Visible = true;

		return this.dom;
	}

	constructor(form, id) {
		this.form = form;
		this.id = id;
		this.form.fields.set(this.id, this);

		// 状态
		this.needFetch = true;
		this.ready = false;

		// 属性
		this.type = null;
		this.value = null;
		this.label = null;
		
		this.dom = null;
	}
}

export default class Form {
	static async FromItems(items) {
		const form = new Form();
		for(const item of items)
			await Field.FromItem(form, item);
		return form;
	}

	constructor() {
		this.fields = new Map();
	}

	Find(fieldID) {
		return this.fields.get(fieldID);
	}

	ToDOM() {
		const $form = document.createElement('form');
		for(const field of this.fields.values())
			$form.append(field.DOM);
		return $form;
	}

	ToJSON() {}

	Copy() {}
}
