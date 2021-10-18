import { assert } from 'chai';
import { address, TEST_NET_CHAIN_ID } from '@waves/ts-lib-crypto';
import { invokeScript } from "@waves/waves-transactions";
import { broadcastTx, arrayItemAt } from "../../src/sdk/utils";
import { revealRandomsAndReplaceMakerTx } from "../../src/sdk/v2/gameTransactions";
import {
    getPlayerCurrentGame,
    getBlockHeight,
    getRarity,
    getStep,
    getExpirationHeight,
    getRange,
    getRandoms,
    getReplacedRange,
    getDuckId,
    calcRarity,
} from "../../src/sdk/v2/gameData";
import {
    MAKER_SEED,
    TAKER_SEED,
    MAKER_RANDOMS,
    TAKER_RANDOMS,
    MAKER_SALT,
    IMPOSTOR_SEED,
    STEP_DURATION,
    EGG_ID,
    MAKER_BEST_DUCK,
    MAKER_REPLACE_DUCK,
    TAKER_REPLACE_DUCK,
    RANGES,
} from "../../src/settings";

describe('Reveal randoms and replace maker', function() {
    this.timeout(120000);

    it("Impostor can't call", async function () {
        try {
            await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                MAKER_RANDOMS, MAKER_SALT, "medium", MAKER_REPLACE_DUCK), IMPOSTOR_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
        }
    });

    it("Taker can't call", async function () {
        try {
            await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                MAKER_RANDOMS, MAKER_SALT, "medium", MAKER_REPLACE_DUCK), TAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Only maker can call this method");
        }
    });

    it("Invalid asset revert", async function () {
        try {
            await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                MAKER_RANDOMS, MAKER_SALT, "medium", EGG_ID), MAKER_SEED)
            );
        } catch (err) {
            assert.isTrue(err.message.split(': ')[1].includes('not valid NFT'));
        }
    });

    it("Can't play with alien duck", async function () {
        try {
            await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                MAKER_RANDOMS, MAKER_SALT, "medium", TAKER_REPLACE_DUCK), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Asset " + TAKER_REPLACE_DUCK + " doesn't belong to you");
        }
    });

    it("Duck doesn't fit rarity range revert", async function () {
        try {
            await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                MAKER_RANDOMS, MAKER_SALT, "medium", MAKER_BEST_DUCK), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Duck doesn't fit rarity range");
        }
    });

    it("Randoms don't match commit revert", async function () {
        try {
            await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                TAKER_RANDOMS, MAKER_SALT, "medium", TAKER_REPLACE_DUCK), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Randoms don't match commit");
        }
    });

    it("Randoms wrong format revert", async function () {
        try {
            await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                "123124jdsflkds", MAKER_SALT, "medium", MAKER_REPLACE_DUCK), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Randoms don't match commit");
        }
    });

    it("Maker reveals and replaces", async function () {
        const height = await getBlockHeight();
        const gameId = await getPlayerCurrentGame(address(TAKER_SEED, TEST_NET_CHAIN_ID));

        await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
            MAKER_RANDOMS, MAKER_SALT, "medium", MAKER_REPLACE_DUCK), MAKER_SEED)
        );

        const makerRandomsStored = await getRandoms(gameId, "maker")
        const makerWorstRarity = await getRarity(gameId, "maker", "worst");
        const makerMediumRarity = await getRarity(gameId, "maker", "medium");
        const makerBestRarity = await getRarity(gameId, "maker", "best");
        const makerReplacedRange = await getReplacedRange(gameId, "maker");
        const makerDuckId = await getDuckId(gameId, "maker");
        const takerWorstRarity = await getRarity(gameId, "taker", "worst");
        const takerMediumRarity = await getRarity(gameId, "taker", "medium");
        const takerBestRarity = await getRarity(gameId, "taker", "best");
        const gameStep = await getStep(gameId);
        const expirationHeight = await getExpirationHeight(gameId);

        const worstRange = await getRange(gameId, 'worst');
        const mediumRange = await getRange(gameId, 'medium');
        const bestRange = await getRange(gameId, 'best');

        const makerRandoms = MAKER_RANDOMS.split(",").map(Number);
        const takerRandoms = TAKER_RANDOMS.split(",").map(Number);

        const replacedRarity = await calcRarity(MAKER_REPLACE_DUCK);

        assert.equal(makerRandomsStored, MAKER_RANDOMS);
        assert.equal(makerWorstRarity, arrayItemAt(RANGES[worstRange - 1], makerRandoms[0] + takerRandoms[0]));
        assert.equal(makerMediumRarity, replacedRarity);
        assert.equal(makerBestRarity, arrayItemAt(RANGES[bestRange - 1], makerRandoms[2] + takerRandoms[2]));
        assert.equal(makerReplacedRange, "medium");
        assert.equal(makerDuckId, MAKER_REPLACE_DUCK);
        assert.equal(takerWorstRarity, arrayItemAt(RANGES[worstRange - 1], makerRandoms[3] + takerRandoms[3]));
        assert.equal(takerMediumRarity, arrayItemAt(RANGES[mediumRange - 1], makerRandoms[4] + takerRandoms[4]));
        assert.equal(takerBestRarity, arrayItemAt(RANGES[bestRange - 1], makerRandoms[5] + takerRandoms[5]));
        assert.equal(gameStep, 2);
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
    });

    it("Maker can't call again", async function () {
        try {
            await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                MAKER_RANDOMS, MAKER_SALT, "medium", MAKER_REPLACE_DUCK), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "This step is finished");
        }
    });
});
