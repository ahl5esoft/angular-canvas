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