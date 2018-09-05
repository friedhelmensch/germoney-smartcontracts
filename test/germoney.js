const { expectThrow } = require('./utils');
const GermoneyAbstraction = artifacts.require('Germoney');
const web3 = require('web3');
let HST;

contract('Germoney', (accounts) => {
    beforeEach(async () => {
        const exchangeRateDMtoEur = 0.511291881;
        const exchangeRateEthToEur = 700;

        const price = (1 / exchangeRateEthToEur * exchangeRateDMtoEur).toString().substring(0, 18);
        const priceInWei = web3.utils.toWei(price, "ether");

        HST = await GermoneyAbstraction.new(priceInWei, { from: accounts[0] });
    });

    it('transfer valid amount: should be transfered', async () => {

        const oneEtherInWei = web3.utils.toWei(new web3.utils.BN(1), "ether");
        await HST.buy({ from: accounts[2], value: oneEtherInWei });

        const balanceOf2Before = await HST.balanceOf.call(accounts[2]);
        const amountToTransfer = Math.floor(balanceOf2Before.toNumber() / 2);

        await HST.transfer(accounts[3], amountToTransfer, { from: accounts[2] });
        const balanceOf3 = await HST.balanceOf.call(accounts[3]);

        assert.strictEqual(balanceOf3.toNumber(), amountToTransfer);

        const balanceOf2 = await HST.balanceOf.call(accounts[2]);
        assert.strictEqual(balanceOf2.toNumber(), balanceOf2Before.toNumber() - amountToTransfer);
    });

    it('creation price 0 should throw', () => expectThrow(GermoneyAbstraction.new(0, { from: accounts[0] })));

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
        const price = 10;

        await HST.setPrice(price, { from: accounts[0] });

        const buyPrice = await HST.buyPrice.call();
        assert.strictEqual(buyPrice.toNumber(), price);
    });

    it('set price 0 should throw', () => expectThrow(HST.setPrice(0, { from: accounts[0] })));

    it('buy GER: should be returned by balance of', async () => {

        const oneEtherInWei = web3.utils.toWei(new web3.utils.BN(1), "ether");

        await HST.buy({ from: accounts[2], value: oneEtherInWei });

        const buyPrice = await HST.buyPrice.call();

        const balance = await HST.balanceOf.call(accounts[2]);

        var actual = balance.toNumber();
        const expected = parseInt(oneEtherInWei / buyPrice.toNumber());

        assert.strictEqual(expected, actual);

    });

    it('send ether to contract: should buy', async () => {
        var oneEtherInWei = web3.utils.toWei(new web3.utils.BN(1), "ether");
        await HST.sendTransaction({ from: accounts[0], value: oneEtherInWei });
        const balance = await HST.balanceOf.call(accounts[0]);
    })

    it('transfer too much: should be reverted', async () => {

        const oneEtherInWei = web3.utils.toWei(new web3.utils.BN(1), "ether");

        await HST.buy({ from: accounts[2], value: oneEtherInWei });

        const balanceOf2Before = await HST.balanceOf.call(accounts[2]);

        expectThrow(HST.transfer(accounts[3], balanceOf2Before.toNumber() * 2, { from: accounts[2] }));

        const balanceOf3 = await HST.balanceOf.call(accounts[3]);
        assert.strictEqual(balanceOf3.toNumber(), 0);

        const balanceOf2 = await HST.balanceOf.call(accounts[2]);
        assert.strictEqual(balanceOf2.toNumber(), balanceOf2Before.toNumber());
    });

    it('set price from non-owner account. Should fail', () => expectThrow(HST.setPrice(1, { from: accounts[1] })));
});