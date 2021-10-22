import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx } from "../../src/sdk/utils";
import {getPrizeExpiredTx, setOrderMakerTx} from "../../src/sdk/v2/gameTransactions";
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


export const setOrderMakerTest = (order: string) => {
    describe('Set Order Maker', function () {
        this.timeout(120000);

        it("Impostor can't set", async function () {
            try {
                await broadcastTx(invokeScript(setOrderMakerTx(order), IMPOSTOR_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Taker can't set", async function () {
            try {
                await broadcastTx(invokeScript(setOrderMakerTx(order), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Only maker can call this method");
            }
        });

        it("Invalid order data revert 1", async function () {
            try {
                await broadcastTx(invokeScript(setOrderMakerTx('best|medium|wor'), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Invalid order data");
            }
        });

        it("Invalid order data revert 2", async function () {
            try {
                await broadcastTx(invokeScript(setOrderMakerTx('bsanfklasjf;'), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Invalid order data");
            }
        });

        it('Maker sets order', async function () {
            const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
            const gameId = await getPlayerCurrentGame(makerAddress);
            const height = await getBlockHeight();

            await broadcastTx(invokeScript(setOrderMakerTx(order), MAKER_SEED));

            const makerOrder = await getOrder(gameId, "maker");
            const step = await getStep(gameId);
            const expirationHeight = await getExpirationHeight(gameId);

            assert.equal(makerOrder, order);
            assert.equal(step, 5);
            assert.approximately(expirationHeight, height + STEP_DURATION, 1);
        });

        it("Maker can't set order again", async function () {
            try {
                await broadcastTx(invokeScript(setOrderMakerTx(order), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "This step is finished");
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