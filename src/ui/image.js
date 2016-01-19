angular.module('ac.ui.image', []).directive('acUiImage', [
	function () {
		return {
			require: '^acUiNode',
			restrict: 'E',
			link: function (_, __, ___, nodeCtrl) {
				nodeCtrl.init({
					//高度
					height: 0,
					//图片对象
					image: null,
					//剪切宽度
					sheight: 0,
					//剪切宽度
					swidth: 0,
					//开始剪切横坐标
					sx: 0,
					//开始剪切纵坐标
					sy: 0,
					//宽度
					width: 0
				}, function (ctx) {
					if (!this.getImage())
						return;

					var args = [this.getImage()];
					if (this.getSHeight())
						args.push(this.getSX(), this.getSY(), this.getSWidth(), this.getSHeight());
					args.push(this.getX(), this.getY(), this.getWidth(), this.getHeight());
					ctx.drawImage.apply(ctx, args);
				});
			}
		};
	}
]);