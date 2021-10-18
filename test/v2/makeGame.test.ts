import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx, generateCommit } from "../../src/sdk/utils";
import { makeGameTx } from "../../src/sdk/v2/gameTransactions";
import {
    getNextGameId,
    getBlockHeight,
    getPlayerCurrentGame,
    getPlayerRole,
    getMaker,
    getBet,
    getRange,
    getMakerRandomsCommit,
    getSlot,
    getWaitingExpirationHeight,
} from "../../src/sdk/v2/gameData";
import { MAKER_SEED, IMPOSTOR_SEED, WAITING, MAKER_RANDOMS, MAKER_SALT, EGG_ID, WRONG_ASSET_ID} from "../../src/settings";

describe('Make Game', function() {
    this.timeout(120000);
    const BET = 10000;

    it('Invalid slot revert', async function () {
        try {
            await broadcastTx(invokeScript(
                makeGameTx( 10, 1, 2, 3, generateCommit(MAKER_RANDOMS, MAKER_SALT), BET), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid slot')
        }
    });

    it('Invalid bet asset revert', async function () {
        try {
            await broadcastTx(invokeScript(
                makeGameTx( 0, 1, 2, 3, generateCommit(MAKER_RANDOMS, MAKER_SALT), 1, WRONG_ASSET_ID), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You can attach only EGGs with the following asset id - " + EGG_ID)
        }
    });

    it('Invalid bet amount revert (ONLY BETA!!!)', async function () {
        try {
            await broadcastTx(invokeScript(
                makeGameTx( 0, 1, 2, 3, generateCommit(MAKER_RANDOMS, MAKER_SALT), BET + 1), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Bet must be 0.0001 EGG during beta test")
        }
    });

    it('Invalid range for the worst duck revert', async function () {
        try {
            await broadcastTx(invokeScript(
                makeGameTx( 0, 0, 2, 3, generateCommit(MAKER_RANDOMS, MAKER_SALT), BET), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid range for the worst duck')
        }
    });

    it('Invalid range for the medium duck revert', async function () {
        try {
            await broadcastTx(invokeScript(
                makeGameTx( 0, 1, 6, 3, generateCommit(MAKER_RANDOMS, MAKER_SALT), BET), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid range for the medium duck')
        }
    });

    it('Invalid range for the best duck revert', async function () {
        try {
            await broadcastTx(invokeScript(
                makeGameTx( 0, 1, 2, 10, generateCommit(MAKER_RANDOMS, MAKER_SALT), BET), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid range for the best duck')
        }
    });

    it('Medium < worst revert', async function () {
        try {
            await broadcastTx(invokeScript(
                makeGameTx( 0, 2, 1, 3, generateCommit(MAKER_RANDOMS, MAKER_SALT), BET), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "The medium range can't be less than the worst one")
        }
    });

    it('Best < medium revert', async function () {
        try {
            await broadcastTx(invokeScript(
                makeGameTx( 0, 2, 2, 1, generateCommit(MAKER_RANDOMS, MAKER_SALT), BET), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "The best range can't be worse than the medium one")
        }
    });


    it('Makes game', async function () {
        const gameId = await getNextGameId();
        const height = await getBlockHeight();

        await broadcastTx(invokeScript(
            makeGameTx( 0, 2, 3, 4, generateCommit(MAKER_RANDOMS, MAKER_SALT), BET), MAKER_SEED)
        );

        const currentPlayerGame = await getPlayerCurrentGame(address(MAKER_SEED, TEST_NET_CHAIN_ID));
        const makerAddress = await getMaker(gameId);
        const playerRole = await getPlayerRole(gameId, address(MAKER_SEED, TEST_NET_CHAIN_ID));
        const bet = await getBet(gameId);
        const worstRange = await getRange(gameId, 'worst');
        const mediumRange = await getRange(gameId, 'medium');
        const bestRange = await getRange(gameId, 'best');
        const makerRandomsCommit = await getMakerRandomsCommit(gameId);
        const waitingExpirationHeight = await getWaitingExpirationHeight(gameId);
        const slotGameId = await getSlot(0);
        const nextGameId = await getNextGameId();

        assert.equal(gameId, currentPlayerGame);
        assert.equal(playerRole, "maker");
        assert.equal(makerAddress, address(MAKER_SEED, TEST_NET_CHAIN_ID));
        assert.equal(bet, BET);
        assert.equal(worstRange, 2);
        assert.equal(mediumRange, 3);
        assert.equal(bestRange, 4);
        assert.equal(makerRandomsCommit, generateCommit(MAKER_RANDOMS, MAKER_SALT))
        assert.equal(waitingExpirationHeight, height + WAITING);
        assert.equal(gameId, slotGameId);
        assert.equal(gameId + 1, nextGameId);
    });

    it("Can't make another game", async function () {
        try {
            await broadcastTx(invokeScript(
                makeGameTx( 0, 2, 3, 4, generateCommit(MAKER_RANDOMS, MAKER_SALT), BET), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'You already have an active game')
        }
    });

    it("Can't occupy a busy slot", async function () {
        try {
            await broadcastTx(invokeScript(
                makeGameTx( 0, 2, 3, 4, generateCommit(MAKER_RANDOMS, MAKER_SALT), BET), IMPOSTOR_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'This slot is busy')
        }
    });
});
