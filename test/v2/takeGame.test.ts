import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import {broadcastTx} from "../../src/sdk/utils";
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
    EGG_ID,
} from "../../src/settings";

describe('Take Game', function() {
    this.timeout(120000);
    const takerRandoms: number[] = TAKER_RANDOMS.split("|").map(Number);
    let gameId = -1;
    let bet = 0;

    before(async () => {
        gameId = await getSlot(0);
        bet = await getBet(gameId);
    });


    it('Invalid slot revert', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                11,
                takerRandoms[0],
                takerRandoms[1],
                takerRandoms[2],
                takerRandoms[3],
                takerRandoms[4],
                takerRandoms[5],
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid slot')
        }
    });

    it('Invalid bet asset revert', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                takerRandoms[1],
                takerRandoms[2],
                takerRandoms[3],
                takerRandoms[4],
                takerRandoms[5],
                false,
                1,
                WRONG_ASSET_ID),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You can attach only EGGs with the following asset id - " + EGG_ID)
        }
    });

    it("Can't take game from empty slot", async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                9,
                takerRandoms[0],
                takerRandoms[1],
                takerRandoms[2],
                takerRandoms[3],
                takerRandoms[4],
                takerRandoms[5],
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'This slot is empty')
        }
    });

    it('Not enough EGGs', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                takerRandoms[1],
                takerRandoms[2],
                takerRandoms[3],
                takerRandoms[4],
                takerRandoms[5],
                false,
                bet - 1),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Insufficient eggs amount')
        }
    });

    it('Too much EGGs', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                takerRandoms[1],
                takerRandoms[2],
                takerRandoms[3],
                takerRandoms[4],
                takerRandoms[5],
                false,
                bet + 1),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Insufficient eggs amount')
        }
    });

    it('Invalid random1 revert (<0)', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                -1,
                takerRandoms[1],
                takerRandoms[2],
                takerRandoms[3],
                takerRandoms[4],
                takerRandoms[5],
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid random1')
        }
    });

    it('Invalid random1 revert (>1T)', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                1000000000001,
                takerRandoms[1],
                takerRandoms[2],
                takerRandoms[3],
                takerRandoms[4],
                takerRandoms[5],
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid random1')
        }
    });

    it('Invalid random2 revert (<0)', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                -1,
                takerRandoms[2],
                takerRandoms[3],
                takerRandoms[4],
                takerRandoms[5],
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid random2')
        }
    });

    it('Invalid random2 revert (>1T)', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                1000000000001,
                takerRandoms[2],
                takerRandoms[3],
                takerRandoms[4],
                takerRandoms[5],
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid random2')
        }
    });

    it('Invalid random3 revert (<0)', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                takerRandoms[1],
                -1,
                takerRandoms[3],
                takerRandoms[4],
                takerRandoms[5],
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid random3')
        }
    });

    it('Invalid random3 revert (>1T)', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                takerRandoms[1],
                1000000000001,
                takerRandoms[3],
                takerRandoms[4],
                takerRandoms[5],
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid random3')
        }
    });

    it('Invalid random4 revert (<0)', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                takerRandoms[1],
                takerRandoms[2],
                -1,
                takerRandoms[4],
                takerRandoms[5],
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid random4')
        }
    });

    it('Invalid random3 revert (>1T)', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                takerRandoms[1],
                takerRandoms[2],
                1000000000001,
                takerRandoms[4],
                takerRandoms[5],
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid random4')
        }
    });

    it('Invalid random5 revert (<0)', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                takerRandoms[1],
                takerRandoms[2],
                takerRandoms[3],
                -1,
                takerRandoms[5],
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid random5')
        }
    });

    it('Invalid random5 revert (>1T)', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                takerRandoms[1],
                takerRandoms[2],
                takerRandoms[3],
                1000000000001,
                takerRandoms[5],
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid random5')
        }
    });

    it('Invalid random6 revert (<0)', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                takerRandoms[1],
                takerRandoms[2],
                takerRandoms[3],
                takerRandoms[4],
                -1,
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid random6')
        }
    });

    it('Invalid random6 revert (>1T)', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                takerRandoms[1],
                takerRandoms[2],
                takerRandoms[3],
                takerRandoms[4],
                1000000000001,
                false,
                bet),
                TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid random6')
        }
    });

    it('Takes game', async function () {
        const height = await getBlockHeight();
        const gamesPlayedBefore = await getGamesPlayed();

        await broadcastTx(invokeScript(takeGameTx(
            0,
            takerRandoms[0],
            takerRandoms[1],
            takerRandoms[2],
            takerRandoms[3],
            takerRandoms[4],
            takerRandoms[5],
            false,
            bet),
            TAKER_SEED));

        const currentPlayerGame = await getPlayerCurrentGame(address(TAKER_SEED, TEST_NET_CHAIN_ID));
        const takerAddress = await getTaker(gameId);
        const playerRole = await getPlayerRole(gameId, address(TAKER_SEED, TEST_NET_CHAIN_ID));
        const takerRandomsStored = await getRandoms(gameId, "taker");
        const takerSkipReplace = await getTakerSkipReplace(gameId);
        const step = await getStep(gameId);
        const expirationHeight = await getExpirationHeight(gameId);
        const slotGameId = await getSlot(0);
        const gamesPlayedAfter = await getGamesPlayed();

        assert.equal(gameId, currentPlayerGame);
        assert.equal(takerAddress, address(TAKER_SEED, TEST_NET_CHAIN_ID));
        assert.equal(playerRole, "taker");
        assert.equal(takerRandomsStored, TAKER_RANDOMS);
        assert.equal(takerSkipReplace, false);
        assert.equal(step, 1);
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
        assert.equal(slotGameId, 0);
        assert.equal(gamesPlayedBefore, gamesPlayedAfter - 1);
    });
});
