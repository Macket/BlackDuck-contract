import { assert } from 'chai';
import { address, TEST_NET_CHAIN_ID } from '@waves/ts-lib-crypto';
import { invokeScript } from "@waves/waves-transactions";
import { broadcastTx } from "../../src/sdk/utils";
import {
    getPrizeExpiredTx,
    replaceTakerTx,
    revealOrderTakerTx,
    setOrderMakerTx
} from "../../src/sdk/v2/gameTransactions";
import {
    getPlayerCurrentGame,
    getBlockHeight,
    getRarity,
    getStep,
    getExpirationHeight,
    getReplacedRange,
    getDuckId,
    calcRarity,
} from "../../src/sdk/v2/gameData";
import {
    MAKER_SEED,
    TAKER_SEED,
    IMPOSTOR_SEED,
    STEP_DURATION,
    EGG_ID,
    MAKER_BEST_DUCK,
    TAKER_SALT,
} from "../../src/settings";

export const replaceTakerTest = (rangeToReplace: string, duckId: string, wrongRarityDuckId: string) => {
    describe('Replace Taker', function () {
        this.timeout(120000);

        it("Impostor can't call", async function () {
            try {
                await broadcastTx(invokeScript(replaceTakerTx(rangeToReplace, duckId), IMPOSTOR_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Maker can't call", async function () {
            try {
                await broadcastTx(invokeScript(replaceTakerTx(rangeToReplace, duckId), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Only taker can call this method");
            }
        });

        it("Wrong range format revert", async function () {
            try {
                await broadcastTx(invokeScript(replaceTakerTx("wrong", duckId), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Invalid range - wrong. Must be worst, medium or best");
            }
        });

        it("Invalid asset revert", async function () {
            try {
                await broadcastTx(invokeScript(replaceTakerTx(rangeToReplace, EGG_ID), TAKER_SEED));
            } catch (err) {
                assert.isTrue(err.message.split(': ')[1].includes('not valid NFT'));
            }
        });

        it("Can't play with alien duck", async function () {
            try {
                await broadcastTx(invokeScript(replaceTakerTx(rangeToReplace, MAKER_BEST_DUCK), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Asset " + MAKER_BEST_DUCK + " doesn't belong to you");
            }
        });

        it("Duck doesn't fit rarity range revert", async function () {
            try {
                await broadcastTx(invokeScript(replaceTakerTx(rangeToReplace, wrongRarityDuckId), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Duck doesn't fit rarity range");
            }
        });


        it("Maker reveals and replaces", async function () {
            const height = await getBlockHeight();
            const gameId = await getPlayerCurrentGame(address(TAKER_SEED, TEST_NET_CHAIN_ID));

            await broadcastTx(invokeScript(replaceTakerTx(rangeToReplace, duckId), TAKER_SEED));

            const takerReplacedRange = await getReplacedRange(gameId, "taker");
            const takerDuckId = await getDuckId(gameId, "taker");
            const takerBestRarity = await getRarity(gameId, "taker", rangeToReplace);
            const gameStep = await getStep(gameId);
            const expirationHeight = await getExpirationHeight(gameId);

            const replacedRarity = await calcRarity(duckId);

            assert.equal(takerBestRarity, replacedRarity);
            assert.equal(takerReplacedRange, rangeToReplace);
            assert.equal(takerDuckId, duckId);
            assert.equal(gameStep, 3);
            assert.approximately(expirationHeight, height + STEP_DURATION, 1);
        });

        it("Taker can't call again", async function () {
            try {
                await broadcastTx(invokeScript(replaceTakerTx(rangeToReplace, duckId), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "This step is finished");
            }
        });

        it("Maker can't set order", async function () {
            try {
                await broadcastTx(invokeScript(setOrderMakerTx("best|medium|worst"), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "This step is not started");
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
