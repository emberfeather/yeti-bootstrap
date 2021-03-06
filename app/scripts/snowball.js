Loan = function(nickname, principal, rate, minPayment) {
	var balance = principal;
	var interest = 0;
	var minPayment = minPayment;
	var periods = 12;
	var periodRate = rate / periods;
	var principal = principal;
	var rate = rate;

	this.nickname = nickname;
	this.schedule = [];

	/**
	 * Getters
	 */

	this.__defineGetter__('balance', function() {
		return balance;
	});

	this.__defineGetter__('interest', function() {
		return interest;
	});

	this.__defineGetter__('minPayment', function() {
		return minPayment;
	});

	this.__defineGetter__('periods', function() {
		return periods;
	});

	this.__defineGetter__('periodRate', function() {
		return periodRate;
	});

	this.__defineGetter__('principal', function() {
		return principal;
	});

	this.__defineGetter__('rate', function() {
		return rate;
	});

	/**
	 * Setters
	 */

	this.__defineSetter__('_balance', function(val) {
		balance = Math.max(parseFloat(val), 0);
	});

	this.__defineSetter__('_interest', function(val) {
		interest = Math.max(parseFloat(val), 0);
	});

	this.__defineSetter__('minPayment', function(val) {
		minPayment = Math.max(parseFloat(val), 0);
	});

	this.__defineSetter__('periods', function(val) {
		periods = Math.max(parseInt(val), 1);
		periodRate = this.rate / periods;
	});

	this.__defineSetter__('principal', function(val) {
		principal = Math.max(parseFloat(val), 0);
	});

	this.__defineSetter__('rate', function(val) {
		rate = Math.max(parseFloat(val), 0);
	});
};

Loan.prototype.addPayment = function(payment, isExtra) {
	var payAmount;
	var payInterest;
	var payPrincipal;
	var line;
	
	if(!isExtra) {
		payInterest = toMoney(this.balance * (this.periodRate / 100));
		payAmount = Math.min(this.balance + payInterest, payment);
		payPrincipal = toMoney(payAmount - payInterest);

		this._balance = toMoney(this.balance - payPrincipal);
		this._interest = toMoney(this.interest + payInterest);

		this.schedule.push({
			amount: toMoney(payAmount),
			interest: toMoney(payInterest),
			principal: toMoney(payPrincipal),
			balance: toMoney(this.balance)
		});
	} else {
		if(!this.schedule.length) {
			throw new Error('Cannot add extra payments without a normal payment first');
		}

		payAmount = Math.min(this.balance, payment);
		payPrincipal = toMoney(payAmount);
		this._balance = toMoney(this.balance - payPrincipal);

		line = this.schedule[this.schedule.length - 1];
		line.amount = toMoney(line.amount + payAmount);
		line.principal = toMoney(line.principal + payPrincipal);
		line.balance = toMoney(this.balance);
	}

	return toMoney(payment - payAmount);
}

Snowball = function() {
	var periods = 12;

	this.currency = '$';

	/**
	 * Getters
	 */

	this.__defineGetter__('periods', function() {
		return periods;
	});

	/**
	 * Setters
	 */

	this.__defineSetter__('periods', function(val) {
		periods = Math.max(parseInt(val), 1);
	});

	/**
	 * Default Strategies
	 * 
	 * Strategies are used to determine the order that the extra money from the snowball should be paid.
	 * Adding a new strategy is as simple as reordering the loans in the order desired.
	 */
	this.strategies = {
		balanceHighLow: function(loans) {
			// Sort the loans by the interest rate, descending
			return loans.sort(function(a, b) {
				var diff = b.principal - a.principal;
				
				// If they have the same interest rate, want the one with the lowest balance first
				if(diff === 0) {
					return b.rate - a.rate;
				}
				
				return diff;
			});
		},
		balanceLowHigh: function(loans) {
			// Sort the loans by the interest rate, descending
			return loans.sort(function(a, b) {
				var diff = a.principal - b.principal;
				
				// If they have the same interest rate, want the one with the lowest balance first
				if(diff === 0) {
					return b.rate - a.rate;
				}
				
				return diff;
			});
		},
		interestHighLow: function(loans) {
			// Sort the loans by the interest rate, descending
			return loans.sort(function(a, b) {
				var diff = b.rate - a.rate;
				
				// If they have the same interest rate, want the one with the lowest balance first
				if(diff === 0) {
					return a.principal - b.principal;
				}
				
				return diff;
			});
		},
		interestLowHigh: function(loans) {
			// Sort the loans by the interest rate, descending
			return loans.sort(function(a, b) {
				var diff = a.rate - b.rate;
				
				// If they have the same interest rate, want the one with the lowest balance first
				if(diff === 0) {
					return a.principal - b.principal;
				}
				
				return diff;
			});
		},
		ratioBalanceMinimumPayment: function(loans) {
			// Sort the loans by the balance to minimum payment ratio, ascending
			return loans.sort(function(a, b) {
				var ratio = (a.principal / a.minPayment) - (b.principal / b.minPayment);
				
				// If they have the same ratio, want the one with the lowest balance first
				if(ratio === 0) {
					return a.principal - b.principal;
				}
				
				return ratio;
			});
		},
		ratioBalanceRate: function(loans) {
			// Sort the loans by the balance to rate ratio, ascending
			return loans.sort(function(a, b) {
				var ratio = (a.principal / a.rate) - (b.principal / b.rate);
				
				// If they have the same ratio, want the one with the lowest balance first
				if(ratio === 0) {
					return a.principal - b.principal;
				}
				
				return ratio;
			});
		},
		minimumPayment: function(loans) {
			// Sort the loans by the minimum balance, ascending
			return loans.sort(function(a, b) {
				var ratio = a.minPayment - b.minPayment;
				
				// If they have the same minPayment, want the one with the lowest balance first
				if(ratio === 0) {
					return a.principal - b.principal;
				}
				
				return ratio;
			});
		},
		minimumPaymentOnly: function(loans) {
			return loans;
		}
	};

	// No extra payments on the minimum payment strategy
	this.strategies.minimumPaymentOnly.noExtra = true;
};

/**
 * Generates a set of schedules based upon the loans and payment information
 */
Snowball.prototype.schedule = function(loans, payment) {
	var schedules = {};
	var snow = this;

	$.each(this.strategies, function(name, strategy) {
		var hasBalance = true;
		var isInterestOnly = false;
		var s;
		
		// Use the strategy to sort the loans
		strategy(loans);

		schedules[name] = {
			length: 0,
			interest: 0,
			principal: 0,
			loans: [],
			extra: 0
		};

		s = schedules[name];

		// Prime the loans
		$.each(loans, function(i, loan) {
			s.loans.push(new Loan(loan.nickname, loan.principal, loan.rate, loan.minPayment));
		});

		while( hasBalance && !isInterestOnly ) {
			var extra = payment;

			// Handle minimum payments
			$.each(s.loans, function(i, loan) {
				if(loan.balance > 0) {
					extra -= loan.minPayment - loan.addPayment(loan.minPayment);
				}
			});

			// Allow a strategy to not use the snowball
			if(!strategy.noExtra && extra > 0) {
				// Keep track of how much extra we used
				s.extra += extra;
				
				// Handle extra money
				$.each(s.loans, function(i, loan) {
					if(loan.balance > 0) {
						extra = loan.addPayment(extra, true);

						// Check if all the extra money is spent
						if(extra < 0.01) {
							return false;
						}
					}
				});
			}

			// Determine if there is anything left to pay off
			hasBalance = false;
			isInterestOnly = true;

			$.each(s.loans, function(i, loan) {
				if(loan.balance > 0) {
					hasBalance = true;

					// As long as there is at least one loan that it is not interest only we are not stuck
					isInterestOnly = isInterestOnly && loan.schedule[loan.schedule.length - 1].principal < 0.01;

					if(loan.schedule.length > 500) {
						console.log('Going a long time', loan.schedule[loan.schedule.length - 1].principal, extra)
						hasBalance = false;
						return false;
					}
				}
			});
		}

		// Calculate schedule totals
		$.each(s.loans, function(i, loan) {
			s.length = Math.max(s.length, loan.schedule.length);
			s.interest += loan.interest;
			s.principal += loan.principal;
		});

		// console.log(name, schedules[name], schedules[name].loans[0].schedule.length, schedules[name].loans[0].schedule[schedules[name].loans[0].schedule.length-1]);
	});

	return schedules;
};
	
function toMoney(amount) {
	return parseFloat(parseFloat(amount).toFixed(2));
}
