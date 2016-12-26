angular.module('appControllers').controller('TrainingCtrl', TrainingCtrl); // get the main module contollers set
TrainingCtrl.$inject = ['$rootScope', '$scope', '$state', '$location', '$window', '$http']; // Inject my dependencies

// create our controller function with all necessary logic
function TrainingCtrl($rootScope, $scope, $state, $location, $window, $http) {

	$scope.$parent.helppage = 'plates/training-help.html';

	var toggles = ['Training_Enabled'];
	var settings = {};
	for (i = 0; i < toggles.length; i++) {
		settings[toggles[i]] = undefined;
	}

	function loadSettings(data) {
		settings = angular.fromJson(data);
		$scope.Training_Enabled = settings.Training_Enabled
	}

	function getSettings() {
		// Simple GET request example (note: responce is asynchronous)
		$http.get(URL_SETTINGS_GET).
		then(function (response) {
			loadSettings(response.data);
			// $scope.$apply();
		}, function (response) {
			for (i = 0; i < toggles.length; i++) {
				settings[toggles[i]] = false;
			}
		});
	};

	function setSettings(msg) {
		// Simple POST request example (note: responce is asynchronous)
		$http.post(URL_SETTINGS_SET, msg).
		then(function (response) {
			loadSettings(response.data);
			// $scope.$apply();
		}, function (response) {
			for (i = 0; i < toggles.length; i++) {
				settings[toggles[i]] = false;
			}
		});
	};

	getSettings();

	$scope.$watchGroup(toggles, function (newValues, oldValues, scope) {
		var newsettings = {}
		var dirty = false;
		for (i = 0; i < newValues.length; i++) {
			if ((newValues[i] !== undefined) && (settings[toggles[i]] !== undefined)) {
				if (newValues[i] !== settings[toggles[i]]) {
					settings[toggles[i]] = newValues[i];
					newsettings[toggles[i]] = newValues[i];
					dirty = true;
				};
			}
		}
		if (dirty) {
			// console.log(angular.toJson(newsettings));
			setSettings(angular.toJson(newsettings));
		}
	});
}
