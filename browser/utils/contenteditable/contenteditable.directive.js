'use strict';

app.directive('contenteditable', function () {
	return {
		restrict: 'A',
		require: '?ngModel',
		link: function (scope, element, attrs, ngModel) {
			if (!ngModel) return;
			function read() {
				ngModel.$setViewValue(element.html());
			}
			ngModel.$render = function () {
				// var sanitary = $sanitize(ngModel.$viewValue || '')
				// element.html(sanitary);

				//the way this is set, you are not sanitizing the html and script tags are allowed
				element.html(ngModel.$viewValue || '');
			};
			element.bind('blur keyup change', function () {
				scope.$apply(read);
			});
		}
	};
});