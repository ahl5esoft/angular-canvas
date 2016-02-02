angular.module('ac.core.animation', []).factory('acCoreAnimation', [
	function () {
		var queue = [];
		return {
			FRAME: 50, //ms
			run: function () {
				$.each(queue, function (f) {
					f.index++;
					if (f.index <= f.max)
						return;

					f.fn();
					f.index = 1;
				});
			},
			add: function (fn, period) {
				if (!period)
					period = 50;

				queue.push({
					fn: fn,
					index: 1,
					max: Math.ceil(period / this.FRAME)
				});
			},
			clear: function () {
				queue = [];
			}
		};
	}
]);