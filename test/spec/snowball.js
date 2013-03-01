'use strict';

(function () {
	suite('loan', function () {
		test('constructor', function () {
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

		test('setter: _balance', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			loan._balance = 900;

			assert.equal(loan.balance, 900, 'new');
		});

		test('setter: minPayment', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			loan.minPayment = 50;

			assert.equal(loan.minPayment, 50, 'new');

			loan.minPayment = -50;

			assert.equal(loan.minPayment, 0, 'negative');
		});

		test('setter: periods', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			loan.periods = 10;

			assert.equal(loan.periods, 10, 'new');
			assert.equal(loan.periodRate, 1, 'new rate');
		});

		test('setter: principal', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			loan.principal = 1100;

			assert.equal(loan.principal, 1100, 'new');

			loan.principal = -100;

			assert.equal(loan.principal, 0, 'negative');
		});

		test('setter: rate', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			loan.rate = 14;

			assert.equal(loan.rate, 14, 'new');

			loan.rate = -10;

			assert.equal(loan.rate, 0, 'negative');
		});
	});
})();