import { assert } from 'chai';
import { address, TEST_NET_CHAIN_ID } from '@waves/ts-lib-crypto';
import { invokeScript } from "@waves/waves-transactions";
import { broadcastTx } from "../../src/sdk/utils";
import { pickDucksTx, wrongPickDucksTx } from "../../src/sdk/v1/gameTransactions";
import { getPlayerCurrentGame, getBlockHeight, getRarity, getStep, getExpirationHeight } from "../../src/sdk/v1/gameData";
import {
    MAKER_SEED,
    TAKER_SEED,
    IMPOSTOR_SEED,
    STEP_DURATION,
    EGG_ID,
    MAKER_WORST_DUCK,
    MAKER_MEDIUM_DUCK,
    MAKER_BEST_DUCK,
    TAKER_WORST_DUCK,
    TAKER_MEDIUM_DUCK,
    TAKER_BEST_DUCK,
    IMPOSTOR_WORST_DUCK,
    IMPOSTOR_MEDIUM_DUCK,
    IMPOSTOR_BEST_DUCK,
} from "../../src/settings";

describe('Pick Ducks', function() {
    this.timeout(120000);

    it("Impostor can't pick", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(IMPOSTOR_WORST_DUCK, IMPOSTOR_MEDIUM_DUCK, IMPOSTOR_BEST_DUCK), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
        }
    });

    it("Maker can't pick before taker", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(MAKER_WORST_DUCK, MAKER_MEDIUM_DUCK, MAKER_BEST_DUCK), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the taker's turn to pick now");
        }
    });

    it("Invalid asset revert", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(EGG_ID, TAKER_MEDIUM_DUCK, TAKER_BEST_DUCK), TAKER_SEED));
        } catch (err) {
            assert.isTrue(err.message.split(': ')[1].includes('not valid NFT'));
        }
    });

    it("Can't send 2 ducks", async function () {
        try {
            await broadcastTx(invokeScript(wrongPickDucksTx(TAKER_WORST_DUCK, TAKER_MEDIUM_DUCK), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "function 'pickDucks takes 3 args but 2 were(was) given");
        }
    });

    it("Taker can't play with alien duck", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(MAKER_WORST_DUCK, TAKER_MEDIUM_DUCK, TAKER_MEDIUM_DUCK), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Asset " + MAKER_WORST_DUCK + " doesn't belong to you");
        }
    });

    it("Taker picks duck", async function () {
        const height = await getBlockHeight();
        const gameId = await getPlayerCurrentGame(address(TAKER_SEED, TEST_NET_CHAIN_ID));

        await broadcastTx(invokeScript(pickDucksTx(TAKER_WORST_DUCK, TAKER_MEDIUM_DUCK, TAKER_BEST_DUCK), TAKER_SEED));

        const worstRarity = await getRarity(gameId, "taker", "worst");
        const mediumRarity = await getRarity(gameId, "taker", "medium");
        const bestRarity = await getRarity(gameId, "taker", "best");
        const gameStep = await getStep(gameId);
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(worstRarity, 13);
        assert.equal(mediumRarity, 27);
        assert.equal(bestRarity, 37);
        assert.equal(gameStep, 1);
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
    });

    it("Taker can't pick again", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(TAKER_WORST_DUCK, TAKER_MEDIUM_DUCK, TAKER_BEST_DUCK), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the maker's turn to pick now");
        }
    });

    it("Maker can't play with alien duck", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(MAKER_WORST_DUCK, MAKER_MEDIUM_DUCK, TAKER_BEST_DUCK), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Asset " + TAKER_BEST_DUCK + " doesn't belong to you");
        }
    });

    it("Maker picks duck", async function () {
        const height = await getBlockHeight();
        const gameId = await getPlayerCurrentGame(address(MAKER_SEED, TEST_NET_CHAIN_ID));

        await broadcastTx(invokeScript(pickDucksTx(MAKER_WORST_DUCK, MAKER_MEDIUM_DUCK, MAKER_BEST_DUCK), MAKER_SEED));

        const worstRarity = await getRarity(gameId, "maker", "worst");
        const mediumRarity = await getRarity(gameId, "maker", "medium");
        const bestRarity = await getRarity(gameId, "maker", "best");
        const gameStep = await getStep(gameId);
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(worstRarity, 13);
        assert.equal(mediumRarity, 22);
        assert.equal(bestRarity, 33);
        assert.equal(gameStep, 2);
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
    });

    it("Maker can't pick again", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(MAKER_WORST_DUCK, MAKER_MEDIUM_DUCK, MAKER_BEST_DUCK), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Ducks have already been picked");
        }
    });
});
