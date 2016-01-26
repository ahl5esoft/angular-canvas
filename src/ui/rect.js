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