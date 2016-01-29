angular.module('ac.core.event', [
	function () {
		var getTrigger = function (e, nodes) {
			for (var i = 0, l = nodes.length; i < l; i++) {
				var node = nodes[i];
				if (node.hit(e.x, e.y))
					return node.getChildren().length ? getTrigger(e, node.getChildren()) : node;
			}
		};
		return {
			click: function (e, nodes) {
				var target = getTrigger(e, nodes);
				//target.fire(
			}
		};
	}
]);