
angular.module('ac.util.strconv', []).factory('acUtilStrconv', function () {
	var TURE_VALUES = ['t', 'true', 'y', 'yes', '1', '是'];
	var parseJson = function (str, defaultValue) {
		try {
			return JSON.parse(str);
		}
		catch (e) {
			return defaultValue;
		}
	};

	return $.reduce(['array', 'bool', 'date', 'float', 'int', 'object'], function (memo, f) {
		memo[
			['to', f[0].toUpperCase(), f.substr(1)].join('')
		] = function (str) {
			return memo.to(f, str);
		};
		return memo;
	}, {
		to: function (type, str) {
			switch (type) {
				case 'array':
					var arr = parseJson(str, []);
					return $.isArray(arr) ? arr : [];
				case 'bool':
					if ($.isBoolean(str))
						return str;

					if ($.isString(str))
						return $.indexOf(TURE_VALUES, str.toLowerCase()) > -1;

					return false;
				case 'date':
					return new Date(str ? Date.parse(str) : 0);
				case 'float':
					return parseFloat(str) || 0;
				case 'int':
					return parseInt(str) || 0;
				case 'object':
					var obj = parseJson(str, {});
					return $.isObject(obj) ? obj : {};
				default:
					return str;
			}
		}
	});
});

angular.module('ac.core.context', []).factory('acCoreContext', [
	'$document', '$interval',
	function ($document, $interval) {
		var FRAME = 1000 / 50; //50帧/s
		var nodes = [];
		var ctx;

		return {
			init: function (width, height) {
				if (ctx)
					return;

				var el = angular.element([
					'<canvas style="left: 0px; position: absolute; top: 0px; z-index: 0;" height="', height, '" width="', width, '">',
					'	您的浏览器不支持canvas',
					'</canvas>'
				].join(''));
				$document.find('body').append(el);

				$.each(['click', 'dblclick', 'mousemove'], function (eventName) {
					el.bind(eventName, function (e) {
						var evt = {
							isBubble: true,
							name: eventName,
							x: e.x,
							y: e.y,
							stopBubbling: function () {
								this.isBubble = false;
							}
						};

						for (var i = 0, l = nodes.length; i < l; i++) {
							nodes[i].fire(evt);
							if (nodes[i].hit(evt.x, evt.y))
								break;
						}
					});
				});
				
				ctx = el[0].getContext('2d');
				
				$interval(function () {
					ctx.clearRect(0, 0, width, height);

					$.chain(nodes).select(function (node) {
						return node.getDisplay();
					}).each(function (node) {
						node.draw(ctx);
					});
				}, FRAME);
			},
			clear: function () {
				nodes = [];
			},
			add: function (node) {
				nodes.push(node);

				nodes = $.sortBy(nodes, function (n) {
					return -node.getZIndex();
				});
			}
		};
	}
]);

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

		Node.prototype.fire = function (evt) {
			if (!this.getDisplay())
				return;

			var eventName = evt.name;
			if (evt.name === 'mousemove') {
				if (this.hit(evt.x, evt.y)) {
					eventName = 'mouseover';
				}
				else if (this.getOver()) {
					eventName = 'mouseout';
				}
			}
			else if (!this.hit(evt.x, evt.y))
				return;

			fireEvent(this, evt);

			if (eventName == evt.name)
				return;
			
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

			evt.name = eventName;
			fireEvent(this, evt);
		};

		var fireEvent = function (node, evt) {
			var isBubble = $.all(node.getChildren(), function (child) {
				child.fire(evt);
				return evt.isBubble;
			});
			if (!isBubble)
				return;

			if (node._events[evt.name])
				node._events[evt.name](evt);
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
			this.setChildren(
				$.sortBy(children, function (n) {
					return -node.getZIndex();
				})
			);
		};

		return Node;
	}
]);

var ATTR_MAP = {
	children: null,
	color: 'string',
	display: 'bool',
	height: 'int',
	id: 'string',
	image: null,
	lineWidth: 'int',
	name: 'string',
	over: 'bool',
	sHeight: 'int',
	size: 'int',
	style: 'string',
	sWidth: 'int',
	sX: 'int',
	sY: 'int',
	text: 'string',
	variant: 'string',
	weight: 'string',
	width: 'int',
	x: 'int',
	y: 'int',
	zIndex: 'int'
};

angular.module('ac.ui.image', []).directive('acUiImage', [
	function () {
		return {
			require: '^acUiNode',
			restrict: 'E',
			link: function (_, __, ___, nodeCtrl) {
				nodeCtrl.init({
					//高度
					height: 0,
					//图片对象
					image: null,
					//剪切宽度
					sHeight: 0,
					//剪切宽度
					sWidth: 0,
					//开始剪切横坐标
					sX: 0,
					//开始剪切纵坐标
					sY: 0,
					//宽度
					width: 0
				}, function (ctx) {
					var image = this.getImage();
					if (!image)
						return;

					var args = [image];
					if (this.getSHeight())
						args.push(this.getSX(), this.getSY(), this.getSWidth(), this.getSHeight());

					var width, height;
					if (this.getWidth() && this.getHeight()) {
						width = this.getWidth();
						height = this.getHeight();
					}
					else {
						width = image.width;
						height = image.height;
					}

					args.push(this.getX(), this.getY(), width, height);
					ctx.drawImage.apply(ctx, args);
				});
			}
		};
	}
]);

angular.module('ac.ui.label', []).directive('acUiLabel', [
	function () {
		return {
			require: '^acUiNode',
			restrict: 'E',
			link: function (_, __, ___, nodeCtrl) {
				nodeCtrl.init({
					//颜色
					color: 'rgb(0, 0, 0)',
					//字体
					name: '微软雅黑',
					//大小
					size: 14,
					//样式 
					style: 'normal',
					//文本
					text: '',
					//变体
					variant: 'normal',
					//粗体
					weight: 'normal'
				}, function (ctx) {
					if (!this.getText())
						return;

					ctx.font = [
						this.getStyle(),
						this.getVariant(),
						this.getWeight(),
						this.getSize() + 'px',
						this.getName()
					].join(' ');
					ctx.fillStyle = this.getColor();
					ctx.fillText(
						this.getText(),
						this.getX(),
						this.getY() + this.getSize()
					);
				});
			}
		};
	}
]);

angular.module('ac.ui.node', ['ac.core.context', 'ac.util.strconv']).directive('acUiNode', [
	'acCoreContext', 'acCoreNode',
	function (ctx, Node) {
		return {
			controller: [
				'$attrs',
				function (attrs) {
					var node = new Node();
					this.node = node;

					this.init = function (opts, draw) {
						node.extend(opts);

						if (draw)
							node.draw = draw;
					};

					if (attrs.acUiNode === 'stage') {
						ctx.clear();
					}
					else {
						ctx.add(node);
					}
				}
			],
			compile: function (el, attrs) {
				el.append(
					['<ac-ui-', attrs.acUiNode, '></ac-ui-', attrs.acUiNode, '>'].join('')
				);
			}
		};
	}
]);

angular.module('ac.ui.rect', []).directive('acUiRect', [
	function () {
		return {
			require: '^acUiNode',
			restrict: 'E',
			link: function (_, __, ___, nodeCtrl) {
				nodeCtrl.init({
					//颜色
					color: 'rgb(0, 0, 0)',
					//高度
					height: 0,
					//线宽度 如果有该属性则会调用stroke
					lineWidth: 0,
					//宽度
					width: 0
				}, function (ctx) {
					if (!(this.getHeight() && this.getWidth()))
						return;

					var method = 'fill';
					if (this.getLineWidth()) {
						method = 'stroke';
						ctx.beginPath();
						ctx.lineWidth = this.getLineWidth();
					}

					ctx.rect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
					ctx[method + 'Style'] = this.getColor();
					ctx[method]();
				});
			}
		};
	}
]);

angular.module('ac.ui.stage', []).directive('acUiStage', [
	function () {
		return {
			priority: 10,
			require: '^acUiNode',
			restrict: 'E',
			link: function (_, el, __, nodeCtrl) {
				el.parent().remove();
			}
		};
	}
]);

var acAttr = angular.module('ac.attr.base', []);
$.each(ATTR_MAP, function (v, name) {
	if (v === null)
		return;

	var directiveName = ['acAttr', name[0].toUpperCase(), name.substr(1)].join('');
	acAttr.directive(directiveName, function () {
		return {
			require: '?^acUiNode',
			link: function (scope, _, attrs, nodeCtrl) {
				scope.$watch(attrs[directiveName], function (v) {
					nodeCtrl.node.attr(name, v);
				}, 1);
			}
		};
	});
});

angular.module('ac.attr.hover-image', []).directive('acAttrHoverImage', [
	function () {
		return {
			require: '?^acUiNode',
			link: function (scope, _, attrs, nodeCtrl) {
				scope.$watch(attrs.acAttrHoverImage, function (v) {
					var img = new Image();
					var mouseout = function () {
						nodeCtrl.node.attr({
							sX: 0,
							sY: 0
						});
					};

					img.src = v;

					img.onload = function () {
						nodeCtrl.node.attr({
							sWidth: img.width / 2,
							sHeight: img.height,
							width: img.width / 2,
							height: img.height
						});
						nodeCtrl.node.setImage(img);
						
						nodeCtrl.node.bind('mouseover', function () {
							nodeCtrl.node.attr({
								sX: img.width / 2,
								sY: 0
							});
						});

						nodeCtrl.node.bind('mouseout', mouseout);
					};

					mouseout();
				}, 1);
			}
		};
	}
]);

angular.module('ac.attr.image', []).directive('acAttrImage', [
	function () {
		return {
			require: '?^acUiNode',
			link: function (scope, _, attrs, nodeCtrl) {
				scope.$watch(attrs.acAttrImage, function (v) {
					var img = new Image();
					img.src = v;

					img.onload = function () {
						nodeCtrl.node.setImage(img);
					};
				}, 1);
			}
		};
	}
]);

angular.module('ac', ['ac.util.strconv', 'ac.core.context', 'ac.core.node', 'ac.ui.image', 'ac.ui.label', 'ac.ui.node', 'ac.ui.rect', 'ac.ui.stage', 'ac.attr.base', 'ac.attr.hover-image', 'ac.attr.image']);