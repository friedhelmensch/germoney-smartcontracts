const { expectThrow } = require('./utils');
const GermoneyAbstraction = artifacts.require('Germoney');

let germoney;

contract('Germoney', (accounts) => {
    beforeEach(async () => {
        const exchangeRateDMtoEur = 0.511291881;
        const exchangeRateEthToEur = 700;

        const price = (1 / exchangeRateEthToEur * exchangeRateDMtoEur).toString().substring(0, 18);
        const priceInWei = web3.utils.toWei(price, "ether");

        germoney = await GermoneyAbstraction.new(priceInWei, { from: accounts[0] });
    });


    it('creation: test total supply', async () => {
        const totalSupply = await germoney.totalSupply.call();
        assert.strictEqual(totalSupply.toNumber(), 1300000000000);
    });

    it('transfer valid amount: should be transfered', async () => {

        const oneEtherInWei = web3.utils.toWei(new web3.utils.BN(1), "ether");
        await germoney.buy({ from: accounts[2], value: oneEtherInWei });

        const balanceOf2Before = await germoney.balanceOf.call(accounts[2]);
        const amountToTransfer = Math.floor(balanceOf2Before.toNumber() / 2);

        await germoney.transfer(accounts[3], amountToTransfer, { from: accounts[2] });
        const balanceOf3 = await germoney.balanceOf.call(accounts[3]);

        assert.strictEqual(balanceOf3.toNumber(), amountToTransfer);

        const balanceOf2 = await germoney.balanceOf.call(accounts[2]);
        assert.strictEqual(balanceOf2.toNumber(), balanceOf2Before.toNumber() - amountToTransfer);
    });

    it('creation price 0 should throw', () => expectThrow(GermoneyAbstraction.new(0, { from: accounts[0] })));


    it('creation: test correct setting of vanity information', async () => {
        const name = await germoney.name.call();
        assert.strictEqual(name, 'Germoney');

        const decimals = await germoney.decimals.call();
        assert.strictEqual(decimals.toNumber(), 2);

        const symbol = await germoney.symbol.call();
        assert.strictEqual(symbol, 'GER');
    });

    it('buy GER: should be returned by balance of', async () => {

        const oneEtherInWei = web3.utils.toWei(new web3.utils.BN(1), "ether");

        await germoney.buy({ from: accounts[2], value: oneEtherInWei });

        const price = await germoney.price.call();

        const balance = await germoney.balanceOf.call(accounts[2]);

        var actual = balance.toNumber();
        const expected = parseInt(oneEtherInWei / price.toNumber());

        assert.strictEqual(expected, actual);

    });

    it('send ether to contract: should buy', async () => {
        var oneEtherInWei = web3.utils.toWei(new web3.utils.BN(1), "ether");
        await germoney.sendTransaction({ from: accounts[0], value: oneEtherInWei });
        const balance = await germoney.balanceOf.call(accounts[0]);
    })

    it('transfer too much: should be reverted', async () => {

        const oneEtherInWei = web3.utils.toWei(new web3.utils.BN(1), "ether");

        await germoney.buy({ from: accounts[2], value: oneEtherInWei });

        const balanceOf2Before = await germoney.balanceOf.call(accounts[2]);

        expectThrow(germoney.transfer(accounts[3], balanceOf2Before.toNumber() * 2, { from: accounts[2] }));

        const balanceOf3 = await germoney.balanceOf.call(accounts[3]);
        assert.strictEqual(balanceOf3.toNumber(), 0);

        const balanceOf2 = await germoney.balanceOf.call(accounts[2]);
        assert.strictEqual(balanceOf2.toNumber(), balanceOf2Before.toNumber());
    });

    it('withdraw send all the ether', async () => {

        const oneEtherInWei = web3.utils.toWei(new web3.utils.BN(1), "ether");

        await germoney.buy({ from: accounts[2], value: oneEtherInWei });

        const balanceBeforeWithdraw = new web3.utils.BN(await web3.eth.getBalance(accounts[1]));
        await germoney.withdraw(accounts[1], { from: accounts[0] });
        const balanceAfterWithdraw = new web3.utils.BN(await web3.eth.getBalance(accounts[1]));

        const expectedBalance = Number(balanceBeforeWithdraw.toString()) + Number(oneEtherInWei.toString());
        const actualBalance = Number(balanceAfterWithdraw.toString());

        assert.strictEqual(expectedBalance, actualBalance);

    });

    it('withdraw from non-owner account. Should throw', () => expectThrow(germoney.withdraw(accounts[1], { from: accounts[1] })));

});