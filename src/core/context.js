angular.module('ac.core.context', []).factory('acCoreContext', [
	'$document', '$interval',
	function ($document, $interval) {
		var FRAME = 1000 / 50; //50帧/s
		var ctx, stage;

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
						var event = {
							x: e.x,
							y: e.y,
							_isBubble: true,
							stopBubbling: function () {
								this._isBubble = false;
							}
						};
						if (stage)
							stage.trigger(eventName, event);
					});
				});
				
				ctx = el[0].getContext('2d');
				
				$interval(function () {
					ctx.clearRect(0, 0, width, height);

					if (stage)
						stage.draw(ctx);
				}, FRAME);
			},
			setStage: function (_stage) {
				stage = _stage;
			},
			addNode: function (node) {
				if (stage)
					stage.addChild(node);
			}
		};
	}
]);