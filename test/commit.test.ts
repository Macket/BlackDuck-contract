import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx } from "../src/sdk/utils";
import {commitTx, pickDucksTx} from "../src/sdk/gameTransactions";
import {
    getPlayerCurrentGame,
    getCommit,
    getStep,
    getBlockHeight,
    getExpirationHeight,
} from "../src/sdk/gameData";
import {
    MAKER_SEED,
    TAKER_SEED,
    IMPOSTOR_SEED,
    MAKER_SALT,
    TAKER_SALT,
    STEP_DURATION,
} from "../src/settings";
import { generateCommit } from '../src/sdk/utils';

describe('Commit', function() {
    this.timeout(120000);

    it("Maker can't commit before taker", async function () {
        try {
            await broadcastTx(invokeScript(commitTx('worst,medium,best', MAKER_SALT), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the taker's turn to pick now");
        }
    });

    it("Impostor can't commit", async function () {
        try {
            await broadcastTx(invokeScript(commitTx('worst,medium,best', MAKER_SALT), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
        }
    });

    it('Taker commits', async function () {
        const takerAddress = address(TAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(takerAddress);
        const gameStepBefore = await getStep(gameId);
        const height = await getBlockHeight();

        assert.equal(gameStepBefore, 2);

        await broadcastTx(invokeScript(commitTx('worst,medium,best', TAKER_SALT), TAKER_SEED));

        const gameStepAfter = await getStep(gameId);
        const takerCommit = await getCommit(gameId, "taker");
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(gameStepAfter, 3);
        assert.equal(takerCommit, generateCommit('worst,medium,best', TAKER_SALT));
        assert.equal(expirationHeight, height + STEP_DURATION);
    });

    it("Taker can't commit again", async function () {
        try {
            await broadcastTx(invokeScript(commitTx("best,medium,worst", TAKER_SALT), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the maker's turn to pick now");
        }
    });

    it('Maker commits', async function () {
        const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(makerAddress);
        const gameStepBefore = await getStep(gameId);
        const height = await getBlockHeight();

        assert.equal(gameStepBefore, 3);

        await broadcastTx(invokeScript(commitTx('best,medium,worst', MAKER_SALT), MAKER_SEED));

        const gameStepAfter = await getStep(gameId);
        const makerCommit = await getCommit(gameId, "maker");
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(gameStepAfter, 4);
        assert.equal(makerCommit, generateCommit('best,medium,worst', MAKER_SALT));
        assert.equal(expirationHeight, height + STEP_DURATION);
    });

    it("Maker can't commit again", async function () {
        try {
            await broadcastTx(invokeScript(commitTx('worst,medium,best', MAKER_SALT), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Commit is finished");
        }
    });
});
