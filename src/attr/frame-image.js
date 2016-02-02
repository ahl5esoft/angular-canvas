/*
	<br x="横向帧数" y="纵向帧数" x-i="横向帧下标" y-i="纵向帧下标" ac-attr-frame-image="图片路径" />
*/
angular.module('ac.attr.frame-image', ['ac.core.animation', 'ac.util.strconv']).directive('acAttrFrameImage', [
	'acCoreAnimation', 'acUtilStrconv',
	function (animation, strconv) {
		return {
			require: '?^acUiNode',
			link: function (scope, _, attrs, nodeCtrl) {
				var xIndex = 0;
				var yIndex = 0;
				var xMax = strconv.toInt(attrs.x);
				var yMax = strconv.toInt(attrs.y);

				scope.$watch(attrs.xI, function (v) {
					xIndex = v < xMax ? v : 0;
				});

				scope.$watch(attrs.yI, function (v) {
					yIndex = v < yMax ? v : 0;
				});

				scope.$watch(attrs.acAttrFrameImage, function (v) {
					var img = new Image();
					img.src = v;

					img.onload = function () {
						var width = img.width / xMax;
						var height = img.height / yMax;
						nodeCtrl.node.attr({
							image: img,
							sX: 0,
							sY: 0,
							sWidth: width,
							sHeight: height,
							width: width,
							height: height
						});

						animation.add(
							function () {
								nodeCtrl.node.attr({
									sX: xIndex * width,
									sY: yIndex * height
								});

								yIndex++;
								if (yIndex >= yMax)
									yIndex = 0;
							},
							strconv.toInt(attrs.interval)
						);
					};
				}, 1);
			}
		};
	}
]);