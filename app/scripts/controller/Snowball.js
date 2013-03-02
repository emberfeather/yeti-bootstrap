function SnowballCtrl($scope) {
	$scope.currency = '$';
	$scope.payment = 200;

	$scope.loans = [
		new Loan('Loan 1', 4335.85, 13.54, 48.92),
		new Loan('Loan 2', 2488.69, 12.33, 25.57),
		new Loan('Loan 3', 6891.83, 11.48, 68.92)
	];
}