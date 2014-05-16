var extrapolation = {
	currentRecurring: 0,
	getRecurring: function (data, year) {
		if (data.recurringDepositsAndWithdrawls && data.recurringDepositsAndWithdrawls.length > extrapolation.currentRecurring) {
			if (data.recurringDepositsAndWithdrawls[extrapolation.currentRecurring].stopYear < year) {
				extrapolation.currentRecurring++;
			}
			
			if (data.recurringDepositsAndWithdrawls.length > extrapolation.currentRecurring) {
				return data.recurringDepositsAndWithdrawls[extrapolation.currentRecurring].amount;
			}
		}
		
		return undefined;
	},
	extrapolate: function (data) {
		var results = [];
		var current = data.startAmount;
		var currentNoInflation = data.startAmount;
		var totalInvested = current;
		extrapolation.currentRecurring = 0;
		
		for (var i=0; i<data.yearsToEvaluate; i++) {
			if( i > 0){
				var earnedThisYear = current * data.annualReturn;
				earnedThisYear = Math.round(earnedThisYear * 100) / 100;
				current += earnedThisYear;
				
				var noInflationEarnedThisYear = currentNoInflation * (data.annualReturn + data.inflation);
				noInflationEarnedThisYear = Math.round(noInflationEarnedThisYear * 100) / 100;
				currentNoInflation += noInflationEarnedThisYear;
				
				var recurring = extrapolation.getRecurring(data, i);
				if (recurring) {
					recurring = Math.round(recurring * 100) / 100; 
					current += recurring;
					currentNoInflation += recurring;
					if (recurring > 0) {
						totalInvested += recurring;
					}
				}
			}
			
			results.push({
				current: current,
				currentNoInflation: currentNoInflation,
				earnedThisYear: earnedThisYear,
				recurring: recurring,
				year: new Date(new Date().getFullYear() + i, 1, 1, 1).getFullYear()
			});
		}
		
		return {
			results: results,
			totalInvested: totalInvested
		};
	}
};