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