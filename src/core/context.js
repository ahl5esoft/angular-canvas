angular.module('ac.core.context', ['ac.core.animation']).factory('acCoreContext', [
	'$document', '$interval', 'acCoreAnimation',
	function ($document, $interval, animation) {
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
				
				$interval(
					function () {
						ctx.clearRect(0, 0, width, height);

						animation.run();

						$.chain(nodes).select(function (node) {
							return node.getDisplay();
						}).each(function (node) {
							node.draw(ctx);
						});
					}, 
					1000 / animation.FRAME
				);
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