var viewModel;

$(document).ready(function(){
	viewModel = {
		startAmount: ko.observable(1000),
		returnOnInvestment: ko.observable(12),
		averageInflation: ko.observable(3),
		yearsToEvaluate: ko.observable(20),
		recurringDepositsAndWithdrawls: ko.observableArray(),
		totalInvested: ko.observable(0),
		netWorth: ko.observable(0)
	};

	viewModel.annualReturn = ko.computed(function(){
		return (viewModel.returnOnInvestment() - viewModel.averageInflation()) / 100;
	});

	viewModel.results = ko.computed(function () {
		var extrapolationModel = {
			startAmount: viewModel.startAmount(),
			annualReturn: viewModel.annualReturn(),
			yearsToEvaluate: viewModel.yearsToEvaluate(),
			recurringDepositsAndWithdrawls: ko.toJS(viewModel.recurringDepositsAndWithdrawls())
		};
		
		var results = extrapolation.extrapolate(extrapolationModel);
		
		viewModel.totalInvested(results.totalInvested);
		viewModel.netWorth(results.results[results.results.length - 1].current);
		
		return results.results;
	});
	
	viewModel.mostRecentRecurring = ko.computed(function() {
		return viewModel.recurringDepositsAndWithdrawls()[viewModel.recurringDepositsAndWithdrawls.length];
	});
	
	viewModel.recurringTypes = ko.observableArray([
		'Deposit',
		'Withdrawl'
	]);
	
	viewModel.selectedRecurringType = ko.observable('Deposit');
	viewModel.selectedRecurringAmount = ko.observable(0);
	viewModel.selectedStopAfter = ko.observable(5);
	
	viewModel.addRecurring = function () {
		var type = viewModel.selectedRecurringType();
		var amount = parseFloat(viewModel.selectedRecurringAmount());
		var numberOfYears = parseInt(viewModel.selectedStopAfter());
		
		var signedAmount = 0;
		
		switch (type) {
			case 'Deposit': signedAmount = amount;
			break;
			case 'Withdrawl': signedAmount = 0 - amount;
			break;
		}
		
		var stopYear = numberOfYears;
		if (viewModel.recurringDepositsAndWithdrawls().length > 0) {
			stopYear += viewModel.mostRecentRecurring().stopYear();
		}
		
		var recurringModel = {
			amount: ko.observable(signedAmount),
			stopYear: ko.observable(stopYear)
		};
		
		recurringModel.actualYear = ko.computed(function() {
			return new Date().getFullYear() + recurringModel.stopYear();
		});
		viewModel.recurringDepositsAndWithdrawls.push(recurringModel);
	};

	ko.applyBindings(viewModel);
});