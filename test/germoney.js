const { expectThrow } = require('./utils');
const GermoneyAbstraction = artifacts.require('Germoney');
let HST;

contract('Germoney', (accounts) => {
    beforeEach(async () => {
        HST = await GermoneyAbstraction.new({ from: accounts[0] });
    });

    
    it('creation: test correct setting of vanity information', async () => {
        const name = await HST.name.call();
        assert.strictEqual(name, 'Germoney');

        const decimals = await HST.decimals.call();
        assert.strictEqual(decimals.toNumber(), 18);

        const symbol = await HST.symbol.call();
        assert.strictEqual(symbol, 'GER');
    });

    it('set price: should be set correctly', async () => {
        const price = 1;

        await HST.setPrice(price, { from: accounts[0] });

        const buyPrice = await HST.buyPrice.call();
        assert.strictEqual(buyPrice.toNumber(), price);
    });

    it('buy:', async () => {
        const price = 1;
        await HST.setPrice(price, { from: accounts[0] });

        const buyPrice = await HST.buyPrice.call();
        assert.strictEqual(buyPrice.toNumber(), price);

        const oneEther = web3.toWei(1, "ether");

        await HST.buy({ from: accounts[2], value: oneEther});

        const balance = await HST.balanceOf.call(accounts[2]);
        var expected = balance.toNumber();
        assert.strictEqual(expected, oneEther * 1);

    });

    //it('set price from non-owner account. Should fail', () => expectThrow(HST.setPrice(0.1, {from: accounts[1]})));
});