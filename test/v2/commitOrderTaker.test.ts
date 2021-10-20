import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx } from "../../src/sdk/utils";
import {commitOrderTakerTx} from "../../src/sdk/v2/gameTransactions";
import {
    getPlayerCurrentGame,
    getTakerOrderCommit,
    getStep,
    getBlockHeight,
    getExpirationHeight,
} from "../../src/sdk/v2/gameData";
import {
    MAKER_SEED,
    TAKER_SEED,
    IMPOSTOR_SEED,
    MAKER_SALT,
    TAKER_SALT,
    STEP_DURATION,
} from "../../src/settings";
import { generateCommit } from '../../src/sdk/utils';

describe('Commit Order Taker', function() {
    this.timeout(120000);

    it("Impostor can't commit", async function () {
        try {
            await broadcastTx(invokeScript(commitOrderTakerTx(generateCommit('worst|medium|best', MAKER_SALT)), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
        }
    });

    it("Maker can't commit", async function () {
        try {
            await broadcastTx(invokeScript(commitOrderTakerTx(generateCommit('worst|medium|best', MAKER_SALT)), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Only taker can call this method");
        }
    });

    it('Taker commits', async function () {
        const takerAddress = address(TAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(takerAddress);
        const gameStepBefore = await getStep(gameId);
        const height = await getBlockHeight();

        assert.equal(gameStepBefore, 3);

        await broadcastTx(invokeScript(commitOrderTakerTx(generateCommit('worst|medium|best', TAKER_SALT)), TAKER_SEED));

        const gameStepAfter = await getStep(gameId);
        const takerCommit = await getTakerOrderCommit(gameId);
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(gameStepAfter, 4);
        assert.equal(takerCommit, generateCommit('worst|medium|best', TAKER_SALT));
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
    });

    it("Taker can't commit again", async function () {
        try {
            await broadcastTx(invokeScript(commitOrderTakerTx(generateCommit('worst|medium|best', TAKER_SALT)), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "This step is finished");
        }
    });
});
