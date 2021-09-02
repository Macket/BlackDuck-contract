import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx } from "../src/sdk/utils";
import { makeGameTx } from "../src/sdk/gameTransactions";
import {
    getNextGameId,
    getBlockHeight,
    getPlayerCurrentGame,
    getPlayerRole,
    getMaker,
    getBetEggs,
    getRarityRange,
    getSlot,
    getWaitingExpirationHeight,
} from "../src/sdk/gameData";
import { MAKER_SEED, IMPOSTOR_SEED, WAITING } from "../src/settings";

describe('Make Game', function() {
    this.timeout(120000);

    it('Invalid slot revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx( 10, 1, 2, 3, 5), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid slot')
        }
    });

    it('Not enough EGGs revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx( 0, 1, 2, 3, 1), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Not enough EGGs')
        }
    });

    it('Invalid rarity range for the worst duck revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx(0,  0, 1, 2, 5), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid rarity range for the worst duck')
        }
    });

    it('Invalid rarity range for the medium duck revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx(0, 1, 6, 2, 5), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid rarity range for the medium duck')
        }
    });

    it('Invalid rarity range for the best duck revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx(0, 1, 2, 10, 5), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid rarity range for the best duck')
        }
    });

    it('Medium <= worst revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx( 0, 1, 1, 3, 5), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'The medium duck must be better than the worst one')
        }
    });

    it('Best <= medium revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx( 0, 1, 2, 1, 5), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'The best duck must be better than the medium one')
        }
    });


    it('Makes game', async function () {
        const gameId = await getNextGameId();
        const height = await getBlockHeight();

        await broadcastTx(invokeScript(makeGameTx(0, 2, 3, 4, 5), MAKER_SEED));

        const currentPlayerGame = await getPlayerCurrentGame(address(MAKER_SEED, TEST_NET_CHAIN_ID));
        const playerRole = await getPlayerRole(gameId, address(MAKER_SEED, TEST_NET_CHAIN_ID));
        const makerAddress = await getMaker(gameId);
        const betEggs = await getBetEggs(gameId);
        const worstRarityRange = await getRarityRange(gameId, 'worst');
        const mediumRarityRange = await getRarityRange(gameId, 'medium');
        const bestRarityRange = await getRarityRange(gameId, 'best');
        const waitingExpirationHeight = await getWaitingExpirationHeight(gameId);
        const slotGameId = await getSlot(0);
        const nextGameId = await getNextGameId();

        assert.equal(gameId, currentPlayerGame);
        assert.equal(playerRole, "maker");
        assert.equal(makerAddress, address(MAKER_SEED, TEST_NET_CHAIN_ID));
        assert.equal(betEggs, 4);
        assert.equal(worstRarityRange, 2);
        assert.equal(mediumRarityRange, 3);
        assert.equal(bestRarityRange, 4);
        assert.equal(waitingExpirationHeight, height + WAITING);
        assert.equal(gameId, slotGameId);
        assert.equal(gameId + 1, nextGameId);
    });

    it("Can't make another game", async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx( 1, 2, 3, 4, 5), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'You already have an active game')
        }
    });

    it("Can't occupy a busy slot", async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx( 0, 2, 3, 4, 5), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'This slot is busy')
        }
    });
});
