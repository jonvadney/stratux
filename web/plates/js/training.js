angular.module('appControllers').controller('TrainingCtrl', TrainingCtrl); // get the main module contollers set
TrainingCtrl.$inject = ['$rootScope', '$scope', '$state', '$location', '$window', '$http']; // Inject my dependencies

// create our controller function with all necessary logic
function TrainingCtrl($rootScope, $scope, $state, $location, $window, $http) {

	$scope.$parent.helppage = 'plates/training-help.html';

	var toggles = ['Traffic_Enabled'];
	var settings = {};
	for (i = 0; i < toggles.length; i++) {
		settings[toggles[i]] = undefined;
	}

	function loadSettings(data) {
		settings = angular.fromJson(data);
		$scope.Traffic_Enabled = settings.Traffic_Enabled

		for (i = 0; i < settings.Traffic.length; i++) {
			settings.Traffic[i].Existing = true
		}
		$scope.Traffic = settings.Traffic
	}

	function getSettings() {
		// Simple GET request example (note: responce is asynchronous)
		$http.get(URL_TRAINING_SETTINGS_GET).
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
		$http.post(URL_TRAINING_SETTINGS_SET, msg).
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

	$scope.currentTrafficValid = function () {
		var valid = true;

		if ($scope.myTraffic != undefined) {
			//Check that all fields are set
			if ($scope.myTraffic.Tail != undefined && 
				$scope.myTraffic.InitLat != undefined && 
				$scope.myTraffic.InitLon != undefined &&
				$scope.myTraffic.Alt != undefined &&
				$scope.myTraffic.Hdg != undefined && 
				$scope.myTraffic.Speed != undefined) {

				//Check if its not an existing item the tail number isn't reused
				if ($scope.myTraffic.Existing != true) {
					for (i = 0; i < $scope.Traffic.length; i++) {
						if ($scope.Traffic[i].Tail == $scope.myTraffic.Tail) {
							valid = false; 
						}
					}	
				} 
			} else {
				valid = false;
			}
		} else { 
			valid = false; 
		}

		return valid;
	};

	$scope.saveTrafic = function () {
		var traffic = { Traffic: { Tail: $scope.myTraffic.Tail, InitLat: $scope.myTraffic.InitLat, InitLon: $scope.myTraffic.InitLon, Alt: $scope.myTraffic.Alt, Hdg: $scope.myTraffic.Hdg, Speed: $scope.myTraffic.Speed, Enabled: $scope.myTraffic.Enabled } }

		setSettings(angular.toJson(traffic))
	}
}
