import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx } from "../src/sdk/utils";
import { takeGameTx } from "../src/sdk/gameTransactions";
import {
    getBlockHeight,
    getPlayerCurrentGame,
    getPlayerRole,
    getTaker,
    getBetEggs,
    getSlot,
    getExpirationHeight,
} from "../src/sdk/gameData";
import { TAKER_SEED, STEP_DURATION } from "../src/settings";

describe('Take Game', function() {
    this.timeout(120000);
    let gameId = -1;
    let betEggs = 0;

    before(async () => {
        gameId = await getSlot(0);
        betEggs = await getBetEggs(gameId);
    });


    it('Invalid slot revert', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 11, betEggs + 2), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid slot')
        }
    });

    it("Can't take game from empty slot", async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 9, betEggs + 2), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'This slot is empty')
        }
    });

    it('Not enough EGGs', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 0, 2), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Insufficient eggs amount')
        }
    });

    it('Too much EGGs', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 0, betEggs + 3), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Insufficient eggs amount')
        }
    });

    it('Takes game', async function () {
        const height = await getBlockHeight();

        await broadcastTx(invokeScript(takeGameTx(0, betEggs + 2), TAKER_SEED));

        const currentPlayerGame = await getPlayerCurrentGame(address(TAKER_SEED, TEST_NET_CHAIN_ID));
        const playerRole = await getPlayerRole(gameId, address(TAKER_SEED, TEST_NET_CHAIN_ID));
        const takerAddress = await getTaker(gameId);
        const expirationHeight = await getExpirationHeight(gameId);
        const slotGameId = await getSlot(0);

        assert.equal(gameId, currentPlayerGame);
        assert.equal(playerRole, "taker");
        assert.equal(takerAddress, address(TAKER_SEED, TEST_NET_CHAIN_ID));
        assert.equal(expirationHeight, height + STEP_DURATION);
        assert.equal(slotGameId, 0);
    });

    it("Can't take expired game", async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 0, betEggs + 2), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'This game is expired')
        }
    });
});
