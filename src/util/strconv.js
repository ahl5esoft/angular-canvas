angular.module('ac.util.strconv', []).factory('acUtilStrconv', function () {
	var TURE_VALUES = ['t', 'true', 'y', 'yes', '1', '是'];
	var parseJson = function (str, defaultValue) {
		try {
			return JSON.parse(str);
		}
		catch (e) {
			return defaultValue;
		}
	};

	return $.reduce(['array', 'bool', 'date', 'float', 'int', 'object'], function (memo, f) {
		memo[
			['to', f[0].toUpperCase(), f.substr(1)].join('')
		] = function (str) {
			return memo.to(f, str);
		};
		return memo;
	}, {
		to: function (type, str) {
			switch (type) {
				case 'array':
					var arr = parseJson(str, []);
					return $.isArray(arr) ? arr : [];
				case 'bool':
					if ($.isBoolean(str))
						return str;

					if ($.isString(str))
						return $.indexOf(TURE_VALUES, str.toLowerCase()) > -1;

					return false;
				case 'date':
					return new Date(str ? Date.parse(str) : 0);
				case 'float':
					return parseFloat(str) || 0;
				case 'int':
					return parseInt(str) || 0;
				case 'object':
					var obj = parseJson(str, {});
					return $.isObject(obj) ? obj : {};
				default:
					return str;
			}
		}
	});
});