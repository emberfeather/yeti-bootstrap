'use strict';

(function () {
	suite('loan', function () {
		test('default constructor', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			assert.equal(loan.nickname, 'nickname');
			assert.equal(loan.principal, 1000);
			assert.equal(loan.rate, 10);
			assert.equal(loan.minPayment, 25);
			assert.equal(loan.balance, 1000);
			assert.equal(loan.interest, 0);
			assert.equal(loan.periods, 12);
			assert.equal(loan.periodRate, 10 / 12);
		});

		test('periods setter', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			assert.equal(loan.periods, 12, 'original periods');

			loan.periods = 10;

			assert.equal(loan.periods, 10, 'new periods');
			assert.equal(loan.periodRate, 1, 'new period rate');
		});
	});
})();
