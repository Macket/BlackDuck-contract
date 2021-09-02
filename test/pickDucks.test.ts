import { assert } from 'chai';
import { address, TEST_NET_CHAIN_ID } from '@waves/ts-lib-crypto';
import { invokeScript } from "@waves/waves-transactions";
import { broadcastTx } from "../src/sdk/utils";
import { pickDucksTx, wrongPickDucksTx } from "../src/sdk/gameTransactions";
import { getPlayerCurrentGame, getBlockHeight, getRarity, getStep, getExpirationHeight } from "../src/sdk/gameData";
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
} from "../src/settings";

describe('Pick Ducks', function() {
    this.timeout(120000);

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
            assert.strictEqual(err.message.split(': ')[1], 'not valid NFT')
        }
    });

    it("Can't send 2 ducks", async function () {
        try {
            await broadcastTx(invokeScript(wrongPickDucksTx(TAKER_WORST_DUCK, TAKER_MEDIUM_DUCK), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Index 2 out of bounds for length 2')
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
        assert.equal(expirationHeight, height + STEP_DURATION);
    });

    it("Taker can't pick again", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(TAKER_WORST_DUCK, TAKER_MEDIUM_DUCK, TAKER_BEST_DUCK), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the maker's turn to pick now");
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
        assert.equal(expirationHeight, height + STEP_DURATION);
    });

    it("Maker can't pick again", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(MAKER_WORST_DUCK, MAKER_MEDIUM_DUCK, MAKER_BEST_DUCK), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Ducks have already been picked");
        }
    });
});
