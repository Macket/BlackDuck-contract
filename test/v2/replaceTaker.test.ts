import { assert } from 'chai';
import { address, TEST_NET_CHAIN_ID } from '@waves/ts-lib-crypto';
import { invokeScript } from "@waves/waves-transactions";
import { broadcastTx } from "../../src/sdk/utils";
import { replaceTakerTx } from "../../src/sdk/v2/gameTransactions";
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
    TAKER_WORST_DUCK,
    MAKER_REPLACE_DUCK,
    TAKER_REPLACE_DUCK,
} from "../../src/settings";

describe('Reveal randoms and replace maker', function() {
    this.timeout(120000);

    it("Impostor can't call", async function () {
        try {
            await broadcastTx(invokeScript(replaceTakerTx("best", TAKER_REPLACE_DUCK), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
        }
    });

    it("Wrong range format revert", async function () {
        try {
            await broadcastTx(invokeScript(replaceTakerTx("wrong", TAKER_REPLACE_DUCK), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Invalid range - wrong. Must be worst, medium or best");
        }
    });

    it("Maker can't call", async function () {
        try {
            await broadcastTx(invokeScript(replaceTakerTx("best", TAKER_REPLACE_DUCK), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Only taker can call this method");
        }
    });

    it("Invalid asset revert", async function () {
        try {
            await broadcastTx(invokeScript(replaceTakerTx("best", EGG_ID), TAKER_SEED));
        } catch (err) {
            assert.isTrue(err.message.split(': ')[1].includes('not valid NFT'));
        }
    });

    it("Can't play with alien duck", async function () {
        try {
            await broadcastTx(invokeScript(replaceTakerTx("best", MAKER_REPLACE_DUCK), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Asset " + MAKER_REPLACE_DUCK + " doesn't belong to you");
        }
    });

    it("Duck doesn't fit rarity range revert", async function () {
        try {
            await broadcastTx(invokeScript(replaceTakerTx("best", TAKER_WORST_DUCK), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Duck doesn't fit rarity range");
        }
    });


    it("Maker reveals and replaces", async function () {
        const height = await getBlockHeight();
        const gameId = await getPlayerCurrentGame(address(TAKER_SEED, TEST_NET_CHAIN_ID));

        await broadcastTx(invokeScript(replaceTakerTx("best", TAKER_REPLACE_DUCK), TAKER_SEED));

        const takerReplacedRange = await getReplacedRange(gameId, "taker");
        const takerDuckId = await getDuckId(gameId, "taker");
        const takerBestRarity = await getRarity(gameId, "taker", "best");
        const gameStep = await getStep(gameId);
        const expirationHeight = await getExpirationHeight(gameId);

        const replacedRarity = await calcRarity(TAKER_REPLACE_DUCK);

        assert.equal(takerBestRarity, replacedRarity);
        assert.equal(takerReplacedRange, "best");
        assert.equal(takerDuckId, TAKER_REPLACE_DUCK);
        assert.equal(gameStep, 3);
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
    });

    it("Taker can't call again", async function () {
        try {
            await broadcastTx(invokeScript(replaceTakerTx("best", TAKER_REPLACE_DUCK), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "This step is finished");
        }
    });
});
