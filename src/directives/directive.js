var scope;
class Directive {
	constructor(props) {
		this.name = name;
		scope = this;
	}
	// Corresponds to Vue's update Hook
	update(el, binding, vnode) {
		scope.handleConfirm(el, binding, vnode);
	}
	handleConfirm(el, binding, vNode) {
		let value = binding.value, // Bound value
			name = binding.name, // Custom directive name
			vnode = vNode, // Virtual DOM tree
			oldValue = binding.oldValue;
		vm.$nextTick(() => {
			if (el.className.indexOf('disabled') >= 0) {
				el.onclick = null;
				return;
			};
			if (name === 'confirm' && value && el.className.indexOf('disabled') <= 0) {
				if (value.msg) {
					el.onclick = () => {
						// Triggered when it's an object
						if (value instanceof Object) {
							vm.$confirm[value.type ? value.type : 'confirm']({
								msg: value.msg ? value.msg : '',
								icon: value.icon ? value.icon : 'icon-question',
								title: value.title ? value.title : 'Tip'
							})
								.then(() => {
									value.ok();
								}).catch(() => {
									if (value.cancel)
										value.cancel();
								});
						}
					}
				}
			}
			let val = Object.prototype.toString.call(value)
			if (val === '[object String]' && el.ariaDisabled) {
				// Triggered when it's a String type
				let val = Object.prototype.toString.call(value);
				if (val === '[object String]') {
					vm.$confirm.info({
						msg: value,
						icon: 'icon-warning',
					}).then(() => {
						value.ok();
					}).catch(() => {
						if (value.cancel)
							value.cancel();
					});
				}
			}
		})
	}
	// Corresponds to Vue's mounted Hook
	bind(el, binding, vNode) {
		scope.handleConfirm(el, binding, vNode);
	}

	// Corresponds to Vue's created Hook
	insert() {

	}
	// Unbind corresponds to destroyed Hook
	unbind(el, binding, vNode) {
		let value = binding.value, // Bound value
			name = binding.name, // Custom directive name
			vnode = vNode; // Virtual DOM tree
		if (name === 'confirm') {
			el.onclick = null;
		}
	}
}

export default new Directive();
