import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx } from "../../src/sdk/utils";
import { revealOrderTakerTx } from "../../src/sdk/v2/gameTransactions";
import {
    getPlayerCurrentGame,
    getOrder,
    getStep,
    getBet,
    getPlayerResult,
    getPlayerPrize,
    getPlayerWins,
    getPlayerLoses,
    getEggBalance,
    getPlayerPnL,
} from "../../src/sdk/v2/gameData";
import {
    MAKER_SEED,
    TAKER_SEED,
    IMPOSTOR_SEED,
    TAKER_SALT,
} from "../../src/settings";


describe('Reveal Order Taker', function() {
    this.timeout(120000);

    it("Impostor can't reveal", async function () {
        try {
            await broadcastTx(invokeScript(revealOrderTakerTx('worst|medium|best', TAKER_SALT), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
        }
    });
    
    it("Maker can't reveal", async function () {
        try {
            await broadcastTx(invokeScript(revealOrderTakerTx('worst|medium|best', TAKER_SALT), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Only taker can call this method");
        }
    });

    it("Invalid order data revert", async function () {
        try {
            await broadcastTx(invokeScript(revealOrderTakerTx('best|medium|wor', TAKER_SALT), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Invalid order data");
        }
    });

    it("Commit-reveal mismatch revert", async function () {
        try {
            await broadcastTx(invokeScript(revealOrderTakerTx('best|medium|worst', TAKER_SALT), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Reveal doesn't match commit");
        }
    });

    it('Taker reveals', async function () {
        const takerAddress = address(TAKER_SEED, TEST_NET_CHAIN_ID);
        const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(takerAddress);
        const bet = await getBet(gameId);
        const makerWinsBefore = await getPlayerWins(makerAddress);
        const takerLosesBefore = await getPlayerLoses(takerAddress);
        const makerPnLBefore = await getPlayerPnL(makerAddress);
        const takerPnLBefore = await getPlayerPnL(takerAddress);
        const makerEggBalanceBefore = await getEggBalance(makerAddress);

        const gameStepBefore = await getStep(gameId);
        assert.equal(gameStepBefore, 5);

        await broadcastTx(invokeScript(revealOrderTakerTx('worst|medium|best', TAKER_SALT), TAKER_SEED));

        const takerOrder = await getOrder(gameId, "taker");
        const makerCurrentGame = await getPlayerCurrentGame(makerAddress);
        const takerCurrentGame = await getPlayerCurrentGame(takerAddress);
        const makerWinsAfter = await getPlayerWins(makerAddress);
        const takerLosesAfter = await getPlayerLoses(takerAddress);
        const makerResult = await getPlayerResult(gameId, makerAddress);
        const makerPrize = await getPlayerPrize(gameId, makerAddress);
        const takerResult = await getPlayerResult(gameId, takerAddress);
        const takerPrize = await getPlayerPrize(gameId, takerAddress);
        const makerPnLAfter = await getPlayerPnL(makerAddress);
        const takerPnLAfter = await getPlayerPnL(takerAddress);
        const makerEggBalanceAfter = await getEggBalance(makerAddress);

        assert.equal(takerOrder, 'worst|medium|best');
        assert.equal(makerCurrentGame, 0);
        assert.equal(takerCurrentGame, 0);
        assert.equal(makerWinsAfter, makerWinsBefore + 1);
        assert.equal(takerLosesAfter, takerLosesBefore + 1);
        assert.equal(makerResult, "win");
        assert.equal(takerResult, "lose");
        assert.equal(makerPrize, bet);
        assert.equal(takerPrize, -bet);
        assert.equal(makerPnLAfter, makerPnLBefore + bet);
        assert.equal(takerPnLAfter, takerPnLBefore - bet);
        assert.equal(makerEggBalanceAfter - makerEggBalanceBefore, bet * 2, "Winner EGG balance error");
    });

    it("Taker can't reveal again", async function () {
        try {
            await broadcastTx(invokeScript(revealOrderTakerTx('worst|medium|best', TAKER_SALT), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
        }
    });
});
