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