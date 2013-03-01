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

		test('setter: _interest', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			loan._interest = 25;

			assert.equal(loan.interest, 25, 'new');
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

			loan.periods = -24;

			assert.equal(loan.periods, 1, 'negative');
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

		test('payment: simple', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			assert.closeTo(loan.addPayment(100), 0, .001, 'extra');

			assert.closeTo(loan.balance, 908.33, .001);
			assert.closeTo(loan.interest, 8.33, .001);
		});

		test('payment: multiple', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			assert.closeTo(loan.addPayment(100), 0, .001, 'extra');
			assert.closeTo(loan.addPayment(100), 0, .001, 'extra');
			assert.closeTo(loan.addPayment(100), 0, .001, 'extra');

			assert.closeTo(loan.balance, 722.70, .001);
			assert.closeTo(loan.interest, 22.70, .001);
		});

		test('payment: overpayment', function () {
			var loan = new Loan('nickname', 100, 10, 25);

			assert.closeTo(loan.addPayment(125), 24.17, .001, 'extra');

			assert.closeTo(loan.balance, 0, .001);
			assert.closeTo(loan.interest, 0.83, .001);
		});

		test('payment: extra', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			assert.closeTo(loan.addPayment(100), 0, .001, 'extra');
			assert.closeTo(loan.addPayment(100, true), 0, .001, 'extra');

			assert.closeTo(loan.balance, 808.33, .001);
			assert.closeTo(loan.interest, 8.33, .001);
		});

		test('payment: extra without previous payment', function () {
			var loan = new Loan('nickname', 1000, 10, 25);

			assert.throw(function() {
				loan.addPayment(100, true);
			}, Error, 'normal payment first');
		});
	});

	suite('snowball', function () {
		test('constructor', function () {
			var snowball = new Snowball();

			assert.equal(snowball.currency, '$');
			assert.equal(snowball.periods, 12);
		});

		test('setter: currency', function () {
			var snowball = new Snowball();

			snowball.currency = '£';

			assert.equal(snowball.currency, '£', 'new');
		});

		test('setter: periods', function () {
			var snowball = new Snowball();

			snowball.periods = 10;

			assert.equal(snowball.periods, 10, 'new');

			snowball.periods = -24;

			assert.equal(snowball.periods, 1, 'negative');
		});
	});
})();
