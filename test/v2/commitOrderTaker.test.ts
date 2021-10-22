import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx } from "../../src/sdk/utils";
import {commitOrderTakerTx, getPrizeExpiredTx, revealOrderTakerTx} from "../../src/sdk/v2/gameTransactions";
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
    STEP_DURATION,
    TAKER_SALT,
} from "../../src/settings";
import { generateCommit } from '../../src/sdk/utils';

export const commitOrderTakerTest = (order: string, salt: string) => {
    describe('Commit Order Taker', function () {
        this.timeout(120000);

        it("Impostor can't commit", async function () {
            try {
                await broadcastTx(invokeScript(commitOrderTakerTx(generateCommit(order, salt)), IMPOSTOR_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Maker can't commit", async function () {
            try {
                await broadcastTx(invokeScript(commitOrderTakerTx(generateCommit(order, salt)), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Only taker can call this method");
            }
        });

        it('Taker commits', async function () {
            const takerAddress = address(TAKER_SEED, TEST_NET_CHAIN_ID);
            const gameId = await getPlayerCurrentGame(takerAddress);
            const height = await getBlockHeight();

            await broadcastTx(invokeScript(commitOrderTakerTx(generateCommit(order, salt)), TAKER_SEED));

            const gameStepAfter = await getStep(gameId);
            const takerCommit = await getTakerOrderCommit(gameId);
            const expirationHeight = await getExpirationHeight(gameId);

            assert.equal(gameStepAfter, 4);
            assert.equal(takerCommit, generateCommit(order, salt));
            assert.approximately(expirationHeight, height + STEP_DURATION, 1);
        });

        it("Taker can't commit again", async function () {
            try {
                await broadcastTx(invokeScript(commitOrderTakerTx(generateCommit(order, salt)), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "This step is finished");
            }
        });

        it("Taker can't reveal order", async function () {
            try {
                await broadcastTx(invokeScript(revealOrderTakerTx('worst|medium|best', TAKER_SALT), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "This step is not started");
            }
        });

        it("Maker can't get prize", async function () {
            try {
                await broadcastTx(invokeScript(getPrizeExpiredTx(), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Game is not expired");
            }
        });

        it("Taker can't get prize", async function () {
            try {
                await broadcastTx(invokeScript(getPrizeExpiredTx(), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Game is not expired");
            }
        });
    });
}
