'use strict';

(function (Snowball, Loan) {
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

		test('strategy: balanceHighLow', function () {
			var loans = [];
			var snowball = new Snowball();

			loans.push(new Loan('1', 800, 10, 25));
			loans.push(new Loan('2', 500, 8, 25));
			loans.push(new Loan('3', 900, 3, 25));
			loans.push(new Loan('4', 600, 12, 25));

			snowball.strategies['balanceHighLow'](loans);

			assert.equal(loans[0].nickname, '3');
			assert.equal(loans[1].nickname, '1');
			assert.equal(loans[2].nickname, '4');
			assert.equal(loans[3].nickname, '2');
		});

		test('strategy: balanceLowHigh', function () {
			var loans = [];
			var snowball = new Snowball();

			loans.push(new Loan('1', 800, 10, 25));
			loans.push(new Loan('2', 500, 8, 25));
			loans.push(new Loan('3', 900, 3, 25));
			loans.push(new Loan('4', 600, 12, 25));

			snowball.strategies['balanceLowHigh'](loans);

			assert.equal(loans[0].nickname, '2');
			assert.equal(loans[1].nickname, '4');
			assert.equal(loans[2].nickname, '1');
			assert.equal(loans[3].nickname, '3');
		});

		test('strategy: interestHighLow', function () {
			var loans = [];
			var snowball = new Snowball();

			loans.push(new Loan('1', 800, 10, 25));
			loans.push(new Loan('2', 500, 8, 25));
			loans.push(new Loan('3', 900, 3, 25));
			loans.push(new Loan('4', 600, 12, 25));

			snowball.strategies['interestHighLow'](loans);

			assert.equal(loans[0].nickname, '4');
			assert.equal(loans[1].nickname, '1');
			assert.equal(loans[2].nickname, '2');
			assert.equal(loans[3].nickname, '3');
		});

		test('strategy: interestLowHigh', function () {
			var loans = [];
			var snowball = new Snowball();

			loans.push(new Loan('1', 800, 10, 25));
			loans.push(new Loan('2', 500, 8, 25));
			loans.push(new Loan('3', 900, 3, 25));
			loans.push(new Loan('4', 600, 12, 25));

			snowball.strategies['interestLowHigh'](loans);

			assert.equal(loans[0].nickname, '3');
			assert.equal(loans[1].nickname, '2');
			assert.equal(loans[2].nickname, '1');
			assert.equal(loans[3].nickname, '4');
		});

		test('strategy: ratioBalanceMinimumPayment', function () {
			var loans = [];
			var snowball = new Snowball();

			loans.push(new Loan('1', 800, 10, 25));	// 32
			loans.push(new Loan('2', 500, 8, 25));	// 20
			loans.push(new Loan('3', 900, 3, 25));	// 36
			loans.push(new Loan('4', 600, 12, 25));	// 24

			snowball.strategies['ratioBalanceMinimumPayment'](loans);

			assert.equal(loans[0].nickname, '2');
			assert.equal(loans[1].nickname, '4');
			assert.equal(loans[2].nickname, '1');
			assert.equal(loans[3].nickname, '3');
		});

		test('strategy: ratioBalanceRate', function () {
			var loans = [];
			var snowball = new Snowball();

			loans.push(new Loan('1', 800, 10, 25));	// 80
			loans.push(new Loan('2', 500, 8, 25));	// 62.5
			loans.push(new Loan('3', 900, 3, 25));	// 300
			loans.push(new Loan('4', 600, 12, 25));	// 50

			snowball.strategies['ratioBalanceRate'](loans);

			assert.equal(loans[0].nickname, '4');
			assert.equal(loans[1].nickname, '2');
			assert.equal(loans[2].nickname, '1');
			assert.equal(loans[3].nickname, '3');
		});

		test('strategy: minimumPayment', function () {
			var loans = [];
			var snowball = new Snowball();

			loans.push(new Loan('1', 800, 10, 35));
			loans.push(new Loan('2', 500, 8, 25));
			loans.push(new Loan('3', 900, 3, 15));
			loans.push(new Loan('4', 300, 12, 25));

			snowball.strategies['minimumPaymentOnly'](loans);

			assert.equal(loans[0].nickname, '3');
			assert.equal(loans[1].nickname, '4');
			assert.equal(loans[2].nickname, '2');
			assert.equal(loans[3].nickname, '1');
		});

		test('strategy: minimumPaymentOnly', function () {
			var loans = [];
			var snowball = new Snowball();

			loans.push(new Loan('1', 800, 10, 35));
			loans.push(new Loan('2', 500, 8, 25));
			loans.push(new Loan('3', 900, 3, 15));
			loans.push(new Loan('4', 300, 12, 25));

			snowball.strategies['minimumPaymentOnly'](loans);

			assert.equal(loans[0].nickname, '3');
			assert.equal(loans[1].nickname, '4');
			assert.equal(loans[2].nickname, '2');
			assert.equal(loans[3].nickname, '1');

			assert(snowball.strategies['minimumPaymentOnly'].noExtra);
		});
	});
})(Snowball, Loan);
