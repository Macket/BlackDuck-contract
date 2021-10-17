import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import {broadcastTx, generateCommit} from "../../src/sdk/utils";
import {takeGameTx} from "../../src/sdk/v2/gameTransactions";
import {
    getBlockHeight,
    getPlayerCurrentGame,
    getPlayerRole,
    getTaker,
    getBet,
    getSlot,
    getExpirationHeight,
    getRandoms,
    getTakerSkipReplace,
    getStep,
    getGamesPlayed,
} from "../../src/sdk/v2/gameData";
import {
    TAKER_SEED,
    STEP_DURATION,
    TAKER_RANDOMS,
    WRONG_ASSET_ID,
    MAKER_RANDOMS,
    MAKER_SALT,
    MAKER_SEED, EGG_ID
} from "../../src/settings";

describe('Take Game', function() {
    this.timeout(120000);
    let gameId = -1;
    let bet = 0;

    before(async () => {
        gameId = await getSlot(0);
        bet = await getBet(gameId);
    });


    it('Invalid slot revert', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 11, TAKER_RANDOMS, true, bet), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid slot')
        }
    });

    it('Invalid bet asset revert', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 0, TAKER_RANDOMS, true, 1, WRONG_ASSET_ID), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You can attach only EGGs with the following asset id - " + EGG_ID)
        }
    });

    it("Can't take game from empty slot", async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 9, TAKER_RANDOMS, true, bet), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'This slot is empty')
        }
    });

    it('Not enough EGGs', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 0, TAKER_RANDOMS, true, bet - 1), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Insufficient eggs amount')
        }
    });

    it('Too much EGGs', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 0, TAKER_RANDOMS, true, bet + 1), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Insufficient eggs amount')
        }
    });

    it('Takes game', async function () {
        const height = await getBlockHeight();
        const gamesPlayedBefore = await getGamesPlayed();

        await broadcastTx(invokeScript(takeGameTx(0, TAKER_RANDOMS, false, bet), TAKER_SEED));

        const currentPlayerGame = await getPlayerCurrentGame(address(TAKER_SEED, TEST_NET_CHAIN_ID));
        const takerAddress = await getTaker(gameId);
        const playerRole = await getPlayerRole(gameId, address(TAKER_SEED, TEST_NET_CHAIN_ID));
        const takerRandoms = await getRandoms(gameId, "taker");
        const takerSkipReplace = await getTakerSkipReplace(gameId);
        const step = await getStep(gameId);
        const expirationHeight = await getExpirationHeight(gameId);
        const slotGameId = await getSlot(0);
        const gamesPlayedAfter = await getGamesPlayed();

        assert.equal(gameId, currentPlayerGame);
        assert.equal(takerAddress, address(TAKER_SEED, TEST_NET_CHAIN_ID));
        assert.equal(playerRole, "taker");
        assert.equal(takerRandoms, TAKER_RANDOMS);
        assert.equal(takerSkipReplace, false);
        assert.equal(step, 1);
        assert.equal(expirationHeight, height + STEP_DURATION);
        assert.equal(slotGameId, 0);
        assert.equal(gamesPlayedBefore, gamesPlayedAfter - 1);
    });

    it("Can't take expired game", async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(0, TAKER_RANDOMS, true, bet), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'This game is expired')
        }
    });
});
