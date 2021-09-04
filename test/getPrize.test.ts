import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx } from "../src/sdk/utils";
import { getPrizeTx } from "../src/sdk/gameTransactions";
import {
    getPlayerCurrentGame,
    getBetEggs,
    getEggBalance,
    getPrizeSent, getPlayerWins, getPlayerLoses,
} from "../src/sdk/gameData";
import { MAKER_SEED, TAKER_SEED, IMPOSTOR_SEED } from "../src/settings";

describe('Get Prize', function() {
    this.timeout(120000);

    // it("Maker can't get prize when game is not started", async function () {
    //     try {
    //         await broadcastTx(invokeScript(getPrizeTx(), MAKER_SEED));
    //     } catch (err) {
    //         assert.strictEqual(err.message.split(': ')[1], 'Game is not started')
    //     }
    // });
    //
    // it("Can't get prize when game is not finished or expired", async function () {
    //     try {
    //         await broadcastTx(invokeScript(getPrizeTx(), MAKER_SEED));
    //     } catch (err) {
    //         assert.strictEqual(err.message.split(': ')[1], 'Game is not finished or expired')
    //     }
    // });
    //
    // it("Impostor can't steal prize", async function () {
    //     try {
    //         await broadcastTx(invokeScript(getPrizeTx(), IMPOSTOR_SEED));
    //     } catch (err) {
    //         assert.strictEqual(err.message.split(': ')[1], "You don't have an active game")
    //     }
    // });


    it('Winner gets prize', async function () {
        const takerAddress = address(TAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(takerAddress);
        const betEggs = await getBetEggs(gameId);
        const eggBalanceBefore = await getEggBalance(takerAddress);
        const winsBefore = await getPlayerWins(takerAddress);

        await broadcastTx(invokeScript(getPrizeTx(), TAKER_SEED));

        const currentTakerGame = await getPlayerCurrentGame(address(TAKER_SEED, TEST_NET_CHAIN_ID));
        const prizeSent = await getPrizeSent(gameId, "taker");
        const eggBalanceAfter = await getEggBalance(takerAddress);
        const winsAfter = await getPlayerWins(takerAddress);

        assert.equal(currentTakerGame, 0);
        assert.isTrue(prizeSent);
        assert.equal(eggBalanceAfter - eggBalanceBefore, betEggs * 2);
        assert.equal(winsBefore + 1, winsAfter);
    });

    it("Winner can't get prize twice", async function () {
        try {
            await broadcastTx(invokeScript(getPrizeTx(), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game")
        }
    });

    it('Loser leaves the game', async function () {
        const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(makerAddress);
        const eggBalanceBefore = await getEggBalance(makerAddress);
        const losesBefore = await getPlayerLoses(makerAddress);

        await broadcastTx(invokeScript(getPrizeTx(), MAKER_SEED));

        const currentMakerGame = await getPlayerCurrentGame(address(MAKER_SEED, TEST_NET_CHAIN_ID));
        const prizeSent = await getPrizeSent(gameId, "maker");
        const eggBalanceAfter = await getEggBalance(makerAddress);
        const losesAfter = await getPlayerLoses(makerAddress);

        assert.equal(currentMakerGame, 0);
        assert.isTrue(prizeSent)
        assert.equal(eggBalanceAfter, eggBalanceBefore);
        assert.equal(losesBefore + 1, losesAfter);
    });

    it("Loser can't live game twice", async function () {
        try {
            await broadcastTx(invokeScript(getPrizeTx(), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game")
        }
    });
});
