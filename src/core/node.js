angular.module('ac.core.node', []).factory('acCoreNode', [
	'acUtilStrconv',
	function ($strconv) {
		var Node = function () {
			this._attributes = {
				children: [],
				display: true,
				id: '',
				over: false,
				x: 0,
				y: 0,
				zIndex: 0
			};
			this._events = {};
		};

		Node.prototype.extend = function (opts) {
			this._attributes = $.extend(this._attributes, opts);
		};

		Node.prototype.attr = function () {
			var args = Array.prototype.slice.call(arguments);
			if (args.length === 1) {
				if ($.isString(args[0])) {
					return this._attributes[args[0]];
				}
				else {
					$.each(args[0], function (v, k) {
						setAttr(this, k, v);
					}, this);
				}
			}
			else if (args.length === 2) {
				setAttr(this, args[0], args[1]);
			}
		};

		$.each(ATTR_MAP, function (t, f) {
			Node.prototype[
				['set', f[0].toUpperCase(), f.substr(1)].join('')
			] = function (v) {
				setAttr(this, f, v);
			};
			
			Node.prototype[
				['get', f[0].toUpperCase(), f.substr(1)].join('')
			] = function (v) {
				return this._attributes && this._attributes[f];
			};
		});

		function setAttr(node, key, value) {
			if (!$.has(node._attributes, key))
				return;

			node._attributes[key] = ATTR_MAP[key] ? $strconv.to(ATTR_MAP[key], value) : value;
		}

		Node.prototype.show = function () {
			this.setDisplay(true);
		};

		Node.prototype.hide = function () {
			this.setDisplay(false);
		};

		Node.prototype.bind = function (name, fn) {
			this._events[name] = fn;
		};

		Node.prototype.draw = function (ctx) {
			$.chain(this.getChildren()).select(function (node) {
				return node.getDisplay();
			}).sortBy(function (node) {
				return -node.getZIndex();
			}).each(function (node) {
				node.draw(ctx);
			});
		};

		Node.prototype.fire = function (eventName, e) {
			if (!this.getDisplay())
				return;

			if (eventName === 'mousemove') {
				if (this.hit(e.x, e.y)) {
					eventName = 'mouseover';
				}
				else if (this.getOver()) {
					eventName = 'mouseout';
				}
			}
			else if (!this.hit(e.x, e.y))
				return;

			for (var i = 0, l = this.getChildren().length; i < l; i++) {
				this.getChildren()[i].trigger(eventName, event);
				if (!event._isBubble)
					break;
			}

			switch (eventName) {
				case 'mouseover':
					if (this.getOver())
						return;

					this.setOver(true);
					break;
				case 'mouseout':
					this.setOver(false);
					break;
			}

			if (this._events[eventName])
				this._events[eventName](e);
		};

		Node.prototype.hit = function (x, y) {
			if (!(this.getDisplay() && this.getWidth() && this.getHeight()))
				return false;

			return this.getX() <= x && x <= (this.getX() + this.getWidth()) &&
				this.getY() <= y && y <= (this.getY() + this.getHeight());
		};

		Node.prototype.addChild = function (node) {
			var children = this.getChildren();
			if (node.getId()) {
				var isExist = $.any(children, function (child) {
					return child.getId() === node.getId();
				});
				if (isExist)
					return;
			}
			children.push(node);
		};

		return Node;
	}
]);