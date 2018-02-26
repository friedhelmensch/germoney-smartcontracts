const { expectThrow } = require('./utils');
const GermoneyAbstraction = artifacts.require('Germoney');
let HST;

contract('Germoney', (accounts) => {
    beforeEach(async () => {
        HST = await GermoneyAbstraction.new({ from: accounts[0] });
    });

    it('creation: test total supply', async () => {
        const totalSupply = await HST.totalSupply.call();
        assert.strictEqual(totalSupply.toNumber(), 1300000000000);
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

    it('buy GER: should be returned by balance of', async () => {
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

    it('transfer too much: should be reverted', async () => {
        const price = 1;
        await HST.setPrice(price, { from: accounts[0] });

        const buyPrice = await HST.buyPrice.call();
        assert.strictEqual(buyPrice.toNumber(), price);

        const oneEther = web3.toWei(1, "ether");

        await HST.buy({ from: accounts[2], value: oneEther});

        expectThrow(HST.transfer(accounts[3], oneEther * 2, { from: accounts[2]}));

        const balanceOf3 = await HST.balanceOf.call(accounts[3]);
        assert.strictEqual(balanceOf3.toNumber(), 0);

        const balanceOf2 = await HST.balanceOf.call(accounts[2]);
        assert.strictEqual(balanceOf2.toNumber(), oneEther * 1);
    });
    

    it('transfer valid amount: should be transfered', async () => {
        const price = 1;
        await HST.setPrice(price, { from: accounts[0] });

        const buyPrice = await HST.buyPrice.call();
        assert.strictEqual(buyPrice.toNumber(), price);

        const oneEther = web3.toWei(1, "ether");
        
        await HST.buy({ from: accounts[2], value: oneEther});

        await HST.transfer(accounts[3], oneEther * 0.5, { from: accounts[2]});

        const balanceOf3 = await HST.balanceOf.call(accounts[3]);
        assert.strictEqual(balanceOf3.toNumber(), oneEther * 0.5);

        const balanceOf2 = await HST.balanceOf.call(accounts[2]);
        assert.strictEqual(balanceOf2.toNumber(), oneEther * 0.5);
    });

    it('set price from non-owner account. Should fail', () => expectThrow(HST.setPrice(0.1, {from: accounts[1]})));
    

    /*
    it('transfer valid amount: should be transfered', async () => {
        
        const exchangeRateDMtoEur = 0.511291881;
        const exchangeRateEthToEur = 711;

        const price = 1/exchangeRateEthToEur * exchangeRateDMtoEur
        console.log(price);
        const priceInWei = web3.toWei(0.000719117, "ether");

        await HST.setPrice(priceInWei, { from: accounts[0] });

        const oneEther = web3.toWei(1, "ether");
        await HST.buy({ from: accounts[0], value: oneEther});
        
        const balanceOf3 = await HST.balanceOf.call(accounts[0]);
        assert.strictEqual(balanceOf3.toNumber(), 1422);
    });*/

});