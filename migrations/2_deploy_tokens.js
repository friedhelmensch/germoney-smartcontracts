const Germoney = artifacts.require('./Germoney.sol');

module.exports = (deployer) => {

  const exchangeRateDMtoEur = 0.511291881;
  const exchangeRateEthToEur = 189;

  const price = (1 / exchangeRateEthToEur * exchangeRateDMtoEur).toString().substring(0, 18);
  const priceInWei = web3.utils.toWei(price, "ether");

  const finalPrice = priceInWei / 100; //The price is for a single token. Since we have 2 decimal places,
                                       // we have an actual token count of initialsupply * 100.
                                       // this needs to be reflected in the price per token.
                                       
   deployer.deploy(Germoney, finalPrice);
};
