var ATTR_MAP = {
	children: null,
	color: 'string',
	display: 'bool',
	height: 'int',
	id: 'string',
	image: null,
	lineWidth: 'int',
	name: 'string',
	sHeight: 'int',
	size: 'int',
	style: 'string',
	sWidth: 'int',
	sX: 'int',
	sY: 'int',
	text: 'string',
	variant: 'string',
	weight: 'string',
	width: 'int',
	x: 'int',
	y: 'int',
	zIndex: 'int'
};
var acAttr = angular.module('ac.attr.base', []);
$.each(ATTR_MAP, function (v, name) {
	if (v === null)
		return;

	var directiveName = ['acAttr', name[0].toUpperCase(), name.substr(1)].join('');
	acAttr.directive(directiveName, function () {
		return {
			require: '?^acUiNode',
			link: function (scope, _, attrs, nodeCtrl) {
				scope.$watch(attrs[directiveName], function (v) {
					nodeCtrl.attr(name, v);
				}, 1);
			}
		};
	});
});