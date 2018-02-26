const { expectThrow } = require('./utils');
const GermoneyAbstraction = artifacts.require('Germoney');
let HST;

contract('Germoney', (accounts) => {
    beforeEach(async () => {
        const exchangeRateDMtoEur = 0.511291881;
        const exchangeRateEthToEur = 711;

        const price = 1/exchangeRateEthToEur * exchangeRateDMtoEur
        const priceInWei = web3.toWei(price, "ether");

        HST = await GermoneyAbstraction.new(priceInWei, { from: accounts[0] });
    });

    
    it('creation: test total supply', async () => {
        const totalSupply = await HST.totalSupply.call();
        assert.strictEqual(totalSupply.toNumber(), 1300000000000);
    });

    it('creation: test correct setting of vanity information', async () => {
        const name = await HST.name.call();
        assert.strictEqual(name, 'Germoney');

        const decimals = await HST.decimals.call();
        assert.strictEqual(decimals.toNumber(), 2);

        const symbol = await HST.symbol.call();
        assert.strictEqual(symbol, 'GER');
    });

    it('set price: should be set correctly', async () => {
        const price = 1;

        await HST.setPrice(price, { from: accounts[0] });

        const buyPrice = await HST.buyPrice.call();
        assert.strictEqual(buyPrice.toNumber(), price);
    });
    
    it('buy GER: should be returned by balance of', async () => {

        const oneEtherInWei = web3.toWei(1, "ether");

        await HST.buy({from: accounts[2], value: oneEtherInWei});
        
        const buyPrice = await HST.buyPrice.call();

        const balance = await HST.balanceOf.call(accounts[2]);
        
        var actual = balance.toNumber();
        const expected = parseInt(oneEtherInWei / buyPrice.toNumber());

        assert.strictEqual(expected, actual);

    });

    it('transfer too much: should be reverted', async () => {

        const oneEtherInWei = web3.toWei(1, "ether");

        await HST.buy({ from: accounts[2], value: oneEtherInWei});

        const balanceOf2Before = await HST.balanceOf.call(accounts[2]);

        expectThrow(HST.transfer(accounts[3], balanceOf2Before.toNumber() * 2, { from: accounts[2]}));

        const balanceOf3 = await HST.balanceOf.call(accounts[3]);
        assert.strictEqual(balanceOf3.toNumber(), 0);

        const balanceOf2 = await HST.balanceOf.call(accounts[2]);
        assert.strictEqual(balanceOf2.toNumber(),balanceOf2Before.toNumber());
    });
 

    it('transfer valid amount: should be transfered', async () => {

        const oneEtherInWei = web3.toWei(1, "ether");
        
        await HST.buy({ from: accounts[2], value: oneEtherInWei});

        const balanceOf2Before = await HST.balanceOf.call(accounts[2]);
        const amountToTransfer = balanceOf2Before.toNumber() * 0.5;

        await HST.transfer(accounts[3], amountToTransfer, { from: accounts[2]});

        const balanceOf3 = await HST.balanceOf.call(accounts[3]);
        assert.strictEqual(balanceOf3.toNumber(), amountToTransfer);

        const balanceOf2 = await HST.balanceOf.call(accounts[2]);
        assert.strictEqual(balanceOf2.toNumber(), balanceOf2Before.toNumber() - amountToTransfer);
    });
   
    it('set price from non-owner account. Should fail', () => expectThrow(HST.setPrice(0.1, {from: accounts[1]})));
    
});