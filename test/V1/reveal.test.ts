import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx } from "../../src/sdk/utils";
import { revealTx } from "../../src/sdk/gameTransactions";
import {
    getPlayerCurrentGame,
    getDuckOrder,
    getStep,
    getBlockHeight,
    getExpirationHeight,
} from "../../src/sdk/gameData";
import {
    MAKER_SEED,
    TAKER_SEED,
    IMPOSTOR_SEED,
    MAKER_SALT,
    TAKER_SALT,
    STEP_DURATION,
} from "../../src/settings";


describe('Reveal', function() {
    this.timeout(120000);

    it("Maker can't reveal before taker", async function () {
        try {
            await broadcastTx(invokeScript(revealTx('worst,medium,best', MAKER_SALT), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the taker's turn to pick now");
        }
    });

    it("Impostor can't reveal", async function () {
        try {
            await broadcastTx(invokeScript(revealTx('worst,medium,best', MAKER_SALT), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
        }
    });

    it("Invalid reveal revert", async function () {
        try {
            await broadcastTx(invokeScript(revealTx('best,medium,wor', TAKER_SALT), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Reveal data is not valid");
        }
    });

    it("Commit-reveal mismatch revert", async function () {
        try {
            await broadcastTx(invokeScript(revealTx('best,medium,worst', TAKER_SALT), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Reveal doesn't match commit");
        }
    });

    it('Taker reveals', async function () {
        const takerAddress = address(TAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(takerAddress);
        const gameStepBefore = await getStep(gameId);
        const height = await getBlockHeight();

        assert.equal(gameStepBefore, 4);

        await broadcastTx(invokeScript(revealTx('worst,medium,best', TAKER_SALT), TAKER_SEED));

        const gameStepAfter = await getStep(gameId);
        const takerDuckOrder = await getDuckOrder(gameId, "taker");
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(gameStepAfter, 5);
        assert.equal(takerDuckOrder, 'worst,medium,best');
        assert.equal(expirationHeight, height + STEP_DURATION);
    });

    it("Taker can't reveal again", async function () {
        try {
            await broadcastTx(invokeScript(revealTx("best,medium,worst", TAKER_SALT), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the maker's turn to pick now");
        }
    });

    it('Maker reveals', async function () {
        const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(makerAddress);
        const gameStepBefore = await getStep(gameId);
        const height = await getBlockHeight();

        assert.equal(gameStepBefore, 5);

        await broadcastTx(invokeScript(revealTx('best,medium,worst', MAKER_SALT), MAKER_SEED));

        const gameStepAfter = await getStep(gameId);
        const makerDuckOrder = await getDuckOrder(gameId, "maker");
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(gameStepAfter, 6);
        assert.equal(makerDuckOrder, 'best,medium,worst');
        assert.equal(expirationHeight, height + STEP_DURATION);
    });

    it("Maker can't reveal again", async function () {
        try {
            await broadcastTx(invokeScript(revealTx('worst,medium,best', MAKER_SALT), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Reveal is finished");
        }
    });
});
