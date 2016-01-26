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
					sHeight: 0,
					//剪切宽度
					sWidth: 0,
					//开始剪切横坐标
					sX: 0,
					//开始剪切纵坐标
					sY: 0,
					//宽度
					width: 0
				}, function (ctx) {
					var image = this.getImage();
					if (!image)
						return;

					var args = [image];
					if (this.getSHeight())
						args.push(this.getSX(), this.getSY(), this.getSWidth(), this.getSHeight());

					var width, height;
					if (this.getWidth() && this.getHeight()) {
						width = this.getWidth();
						height = this.getHeight();
					}
					else {
						width = image.width;
						height = image.height;
					}

					args.push(this.getX(), this.getY(), width, height);
					ctx.drawImage.apply(ctx, args);
				});
			}
		};
	}
]);