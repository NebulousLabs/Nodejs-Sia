// Ensure precision
BigNumber = require('bignumber.js')
BigNumber.config({ DECIMAL_PLACES: 30 });
BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

module.expors = {
  // Convert to Siacoin
  // TODO: Enable commas for large numbers
  convertSiacoin: function (hastings) {
	  // TODO: JS automatically loses precision when taking numbers from the API.
	  // This deals with that imperfectly
	  var number = new BigNumber(hastings);
	  var ConversionFactor = new BigNumber(10).pow(24);
	  return number.dividedBy(ConversionFactor).round(2);
  },

  // Amount has to be a number
  isNumber: function (n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
  },

  // Address has to be lowercase hex and 76 chars
  isAddress: function (str) {
	  return str.match(/^[a-f0-9]{76}$/) !== null;
  }
}

