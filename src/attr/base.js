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
					nodeCtrl.node.attr(name, v);
				}, 1);
			}
		};
	});
});