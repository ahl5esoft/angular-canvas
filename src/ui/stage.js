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