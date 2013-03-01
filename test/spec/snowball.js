'use strict';

(function () {
	suite('loan', function () {
		test('default constructor', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			assert(loan.nickname == 'nickname', "expected nickname to equal `nickname`");
			assert(loan.principal == 1000, "expected principal to equal 1000");
			assert(loan.rate == 10, "expected rate to equal 10");
			assert(loan.minPayment == 25, "expected minPayment to equal 25");
			assert(loan.balance == 1000, "expected balance to equal 1000");
			assert(loan.interest == 0, "expected interest to equal 0");
		});
	});
})();
