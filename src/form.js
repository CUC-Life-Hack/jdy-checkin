class Field {
	static async FromItem(form, item) {
		{
			const existing = form.Find(item);
			if(existing)
				return existing;
		}

		const widget = item.widget;
		const field = new Field(form, widget.widgetName);

		field.needFetch = false;
		field.ready = true;

		field.type = widget.type;
		field.visible = !!widget.visible;
		field.label = item.label;

		return field;
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
		this.visible = false;
		this.label = null;
	}

	ToDOM() {
		if(!this.visible)
			return null;

		const $div = document.createElement('div');
		$div.dataset['widgetName'] = this.id;
		
		const $label = document.createElement('h2');
		$label.classList.add('label');
		$label.innerText = this.label;
		$div.append($label);

		switch(this.type) {
			case 'text': {
				const $input = document.createElement('input');
				$input.type = 'text';
				$input.value = this.value;
				$input.addEventListener('change', () => this.value = $input.value);
				$div.append($input);
				break;
			}
			default:
				$div.append('尚未实现此类型键值控件');
				break;
		}
	
		return $div;
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
		for(const field of this.fields.values()) {
			const dom = field.ToDOM();
			if(!dom)
				continue;
			$form.append(dom);
		}
		return $form;
	}

	ToJSON() {}

	Copy() {}
}
