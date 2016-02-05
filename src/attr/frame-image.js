/*
	<br x="横向帧数" y="纵向帧数" x-i="横向帧下标" y-i="纵向帧下标" ac-attr-frame-image="图片路径" />
*/
angular.module('ac.attr.frame-image', ['ac.core.animation', 'ac.util.strconv']).directive('acAttrFrameImage', [
	'acCoreAnimation', 'acUtilStrconv',
	function (animation, strconv) {
		return {
			require: '?^acUiNode',
			link: function (scope, el, attrs, nodeCtrl) {
				var opts = {};

				$.each({
					xIndex: 'x-i',
					xMax: 'x',
					yIndex: 'y-i',
					yMax: 'y'
				}, function (attr, prop) {
					scope.$watch(
						el.attr(attr),
						function (v) {
							opts[prop] = v;
						}
					);
				});

				animation.add(
					function () {
						nodeCtrl.node.attr({
							sX: opts.xIndex * width,
							sY: opts.yIndex * height
						});

						opts.yIndex++;
						if (opts.yIndex >= opts.yMax)
							opts.yIndex = 0;
					},
					strconv.toInt(attrs.interval)
				);

				scope.$watch(attrs.acAttrFrameImage, function (v) {
					var img = new Image();
					img.src = v;

					img.onload = function () {
						var width = img.width / opts.xMax;
						var height = img.height / opts.yMax;
						nodeCtrl.node.attr({
							image: img,
							sX: 0,
							sY: 0,
							sWidth: width,
							sHeight: height,
							width: width,
							height: height
						});
					};
				}, 1);
			}
		};
	}
]);