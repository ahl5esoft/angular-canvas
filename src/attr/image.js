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