import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx } from "../../src/sdk/utils";
import {getPrizeExpiredTx} from "../../src/sdk/v2/gameTransactions";
import {
    getPlayerCurrentGame,
    getBet,
    getEggBalance,
    getPlayerWins,
    getPlayerLoses,
    getPlayerResult,
    getPlayerPrize,
    getPlayerPnL,
    getStep,
} from "../../src/sdk/v2/gameData";
import {MAKER_SEED, TAKER_SEED, IMPOSTOR_SEED} from "../../src/settings";

describe('Get Prize Expired', function() {
    this.timeout(120000);

    it("Impostor can't call", async function () {
        try {
            await broadcastTx(invokeScript(getPrizeExpiredTx(), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game")
        }
    });
    

    it('Winner gets prize', async function () {
        const takerAddress = address(TAKER_SEED, TEST_NET_CHAIN_ID);
        const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(takerAddress);
        const step = await getStep(gameId);
        const bet = await getBet(gameId);
        const winnerAddress = (step === 1 || step === 4) ? takerAddress : makerAddress
        const loserAddress = (step === 1 || step === 4) ? makerAddress : takerAddress

        const winnerWinsBefore = await getPlayerWins(winnerAddress);
        const loserLosesBefore = await getPlayerLoses(loserAddress);
        const winnerPnLBefore = await getPlayerPnL(winnerAddress);
        const loserPnLBefore = await getPlayerPnL(loserAddress);
        const winnerEggBalanceBefore = await getEggBalance(winnerAddress);

        await broadcastTx(invokeScript(getPrizeExpiredTx(), TAKER_SEED));

        const winnerCurrentGame = await getPlayerCurrentGame(winnerAddress);
        const loserCurrentGame = await getPlayerCurrentGame(loserAddress);
        const winnerWinsAfter = await getPlayerWins(winnerAddress);
        const loserLosesAfter = await getPlayerLoses(loserAddress);
        const winnerResult = await getPlayerResult(gameId, winnerAddress);
        const winnerPrize = await getPlayerPrize(gameId, winnerAddress);
        const loserResult = await getPlayerResult(gameId, loserAddress);
        const loserPrize = await getPlayerPrize(gameId, loserAddress);
        const winnerPnLAfter = await getPlayerPnL(winnerAddress);
        const loserPnLAfter = await getPlayerPnL(loserAddress);
        const winnerEggBalanceAfter = await getEggBalance(winnerAddress);

        assert.equal(winnerCurrentGame, 0);
        assert.equal(loserCurrentGame, 0);
        assert.equal(winnerWinsAfter, winnerWinsBefore + 1);
        assert.equal(loserLosesAfter, loserLosesBefore + 1);
        assert.equal(winnerResult, "win");
        assert.equal(loserResult, "lose");
        assert.equal(winnerPrize, bet);
        assert.equal(loserPrize, -bet);
        assert.equal(winnerPnLAfter, winnerPnLBefore + bet);
        assert.equal(loserPnLAfter, loserPnLBefore - bet);
        assert.equal(winnerEggBalanceAfter - winnerEggBalanceBefore, bet * 2, "Winner EGG balance error");
    });

    it("Taker can't call again", async function () {
        try {
            await broadcastTx(invokeScript(getPrizeExpiredTx(), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game")
        }
    });

    it("Maker can't call again", async function () {
        try {
            await broadcastTx(invokeScript(getPrizeExpiredTx(), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game")
        }
    });
});
