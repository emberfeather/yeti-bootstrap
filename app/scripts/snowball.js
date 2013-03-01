Loan = function(nickname, principal, rate, minPayment) {
	var periods = 12;
	var periodRate = rate / periods;
	var principal = principal;

	this.nickname = nickname;
	this.rate = rate;
	this.minPayment = minPayment;
	this.balance = principal;
	this.interest = 0;
	this.schedule = [];

	this.__defineGetter__('periods', function() {
		return periods;
	});

	this.__defineGetter__('periodRate', function() {
		return periodRate;
	});

	this.__defineGetter__('principal', function() {
		return principal;
	});

	this.__defineSetter__('periods', function(val) {
		periods = val;
		periodRate = this.rate / periods;
	});

	this.__defineSetter__('principal', function(val) {
		principal = Math.max(parseFloat(val), 0);
	});
};

Loan.prototype.addPayment = function(payment, isExtra) {
	var payAmount;
	var payInterest;
	var payPrincipal;
	var line;
	
	if(!isExtra) {
		payAmount = Math.min(this.balance, payment);
		payInterest = toMoney(this.balance * (this.periodRate / 100));
		payPrincipal = toMoney(payAmount - payInterest);

		this.balance = toMoney(this.balance - payPrincipal);
		this.interest = toMoney(this.interest + payInterest);

		this.schedule.push({
			amount: toMoney(payAmount),
			interest: toMoney(payInterest),
			principal: toMoney(payPrincipal),
			balance: toMoney(this.balance)
		});
	} else {
		payAmount = Math.min(this.balance, payment);
		payPrincipal = toMoney(payAmount);
		this.balance = toMoney(this.balance - payPrincipal);

		line = this.schedule[this.schedule.length - 1];
		line.amount = toMoney(line.amount + payAmount);
		line.principal = toMoney(line.principal + payPrincipal);
		line.balance = toMoney(this.balance);
	}

	return toMoney(payment - payAmount);
}

Snowball = function() {
	this.currency = '$';
	this.ppy = 12;
	this.interestOnlyThreshold = 1;

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
			return loans;
		}
	};

	// No extra payments on the minimum payment strategy
	this.strategies.minimumPayment.noExtra = true;
};

/**
 * Generates a set of schedules based upon the loans and payment information
 */
Snowball.prototype.schedule = function(loans, payment) {
	var schedules = {};
	var snow = this;

	$.each(this.strategies, function(name, strategy) {
		var hasBalance = true;
		var isInterestOnly;
		var interestOnlyCount = 0;
		
		// Use the strategy to sort the loans
		strategy(loans);

		schedules[name] = {
			length: 0,
			interest: 0,
			loans: [],
			extra: 0
		};

		s = schedules[name];

		// Prime the loans
		$.each(loans, function(i, loan) {
			s.loans.push(new Loan(loan.nickname, loan.principal, loan.rate, loan.minPayment));
		});

		while( hasBalance && interestOnlyCount < snow.interestOnlyThreshold ) {
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
			
			// If there are only interest-only loans increment the threshold
			if(isInterestOnly && s.extra == 0) {
				interestOnlyCount++;
			}
		}

		// Calculate schedule totals
		$.each(s.loans, function(i, loan) {
			s.length = Math.max(s.length, loan.schedule.length);
			s.interest += loan.interest;
		});

		console.log(name, schedules[name], schedules[name].loans[0].schedule.length, schedules[name].loans[0].schedule[schedules[name].loans[0].schedule.length-1]);
	});

	return schedules;
};
	
function toMoney(amount) {
	return parseFloat(parseFloat(amount).toFixed(2));
}
