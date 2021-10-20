import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx } from "../../src/sdk/utils";
import { setOrderMakerTx } from "../../src/sdk/v2/gameTransactions";
import {
    getPlayerCurrentGame,
    getOrder,
    getStep,
    getBlockHeight,
    getExpirationHeight,
} from "../../src/sdk/v2/gameData";
import {
    MAKER_SEED,
    TAKER_SEED,
    IMPOSTOR_SEED,
    STEP_DURATION,
} from "../../src/settings";


describe('Set Order Maker', function() {
    this.timeout(120000);

    it("Impostor can't set", async function () {
        try {
            await broadcastTx(invokeScript(setOrderMakerTx('worst|medium|best'), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
        }
    });

    it("Taker can't set", async function () {
        try {
            await broadcastTx(invokeScript(setOrderMakerTx('worst|medium|best'), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Only maker can call this method");
        }
    });

    it("Invalid order data revert", async function () {
        try {
            await broadcastTx(invokeScript(setOrderMakerTx('best|medium|wor'), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Invalid order data");
        }
    });

    it('Maker sets order', async function () {
        const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(makerAddress);
        const gameStepBefore = await getStep(gameId);
        const height = await getBlockHeight();

        assert.equal(gameStepBefore, 4);

        await broadcastTx(invokeScript(setOrderMakerTx("best|medium|worst"), MAKER_SEED));

        const gameStepAfter = await getStep(gameId);
        const makerOrder = await getOrder(gameId, "maker");
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(gameStepAfter, 5);
        assert.equal(makerOrder, 'best|medium|worst');
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
    });

    it("Maker can't set order again", async function () {
        try {
            await broadcastTx(invokeScript(setOrderMakerTx("best|medium|worst"), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "This step is finished");
        }
    });
});
