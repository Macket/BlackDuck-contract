import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx } from "../../src/sdk/utils";
import {getPrizeExpiredTx, revealOrderTakerTx} from "../../src/sdk/v2/gameTransactions";
import {
    getPlayerCurrentGame,
    getOrder,
    getBet,
    getPlayerResult,
    getPlayerPrize,
    getPlayerWins,
    getPlayerLoses,
    getPlayerDraws,
    getEggBalance,
    getPlayerPnL,
    getTotalFee,
} from "../../src/sdk/v2/gameData";
import {
    MAKER_SEED,
    TAKER_SEED,
    IMPOSTOR_SEED,
    TAKER_SALT,
    FEE_PERCENT, FEE_AGGREGATOR
} from "../../src/settings";

export const revealOrderTakerTest = (order: string, wrongOrder: string, winnerSeed: string, loserSeed: string, draw: boolean) => {
    describe('Reveal Order Taker', function () {
        this.timeout(120000);

        it("Impostor can't reveal", async function () {
            try {
                await broadcastTx(invokeScript(revealOrderTakerTx(order, TAKER_SALT), IMPOSTOR_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Maker can't reveal", async function () {
            try {
                await broadcastTx(invokeScript(revealOrderTakerTx(order, TAKER_SALT), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Only taker can call this method");
            }
        });

        it("Invalid order data revert 1", async function () {
            try {
                await broadcastTx(invokeScript(revealOrderTakerTx('3|2|14', TAKER_SALT), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Invalid order data");
            }
        });

        it("Invalid order data revert 2", async function () {
            try {
                await broadcastTx(invokeScript(revealOrderTakerTx('bsanfklasjf;', TAKER_SALT), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Invalid order data");
            }
        });

        it("Commit-reveal mismatch revert", async function () {
            try {
                await broadcastTx(invokeScript(revealOrderTakerTx(wrongOrder, TAKER_SALT), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Reveal doesn't match commit");
            }
        });

        if (!draw) {
            it('Taker reveals', async function () {
                const winnerAddress = address(winnerSeed, TEST_NET_CHAIN_ID);
                const loserAddress = address(loserSeed, TEST_NET_CHAIN_ID);
                const gameId = await getPlayerCurrentGame(loserAddress);
                const bet = await getBet(gameId);
                const winnerWinsBefore = await getPlayerWins(winnerAddress);
                const loserLosesBefore = await getPlayerLoses(loserAddress);
                const winnerPnLBefore = await getPlayerPnL(winnerAddress);
                const loserPnLBefore = await getPlayerPnL(loserAddress);
                const winnerEggBalanceBefore = await getEggBalance(winnerAddress);
                const feeAggregatorBalanceBefore = await getEggBalance(FEE_AGGREGATOR);
                const totalFeeBefore = await getTotalFee();

                await broadcastTx(invokeScript(revealOrderTakerTx(order, TAKER_SALT), TAKER_SEED));

                const takerOrder = await getOrder(gameId, "taker");
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
                const feeAggregatorBalanceAfter = await getEggBalance(FEE_AGGREGATOR);
                const totalFeeAfter = await getTotalFee();

                const expectedFee = bet * FEE_PERCENT / 100;

                assert.equal(takerOrder, order);
                assert.equal(winnerCurrentGame, 0);
                assert.equal(loserCurrentGame, 0);
                assert.equal(winnerWinsAfter, winnerWinsBefore + 1);
                assert.equal(loserLosesAfter, loserLosesBefore + 1);
                assert.equal(winnerResult, "win");
                assert.equal(loserResult, "lose");
                assert.equal(winnerPrize, bet - expectedFee);
                assert.equal(loserPrize, -bet);
                assert.equal(winnerPnLAfter, winnerPnLBefore + bet - expectedFee);
                assert.equal(loserPnLAfter, loserPnLBefore - bet);
                assert.equal(winnerEggBalanceAfter - winnerEggBalanceBefore, bet * 2 - expectedFee, "Winner EGG balance error");
                assert.equal(feeAggregatorBalanceAfter - feeAggregatorBalanceBefore, expectedFee, "Fee aggregator EGG balance error");
                assert.equal(totalFeeAfter - totalFeeBefore, expectedFee, "Total fee error");
            });
        }

        if (draw) {
            it('Taker reveals (draw)', async function () {
                const firstAddress = address(winnerSeed, TEST_NET_CHAIN_ID);
                const secondAddress = address(loserSeed, TEST_NET_CHAIN_ID);
                const gameId = await getPlayerCurrentGame(secondAddress);
                const bet = await getBet(gameId);
                const firstDrawsBefore = await getPlayerDraws(firstAddress);
                const secondDrawsBefore = await getPlayerDraws(secondAddress);
                const firstPnLBefore = await getPlayerPnL(firstAddress);
                const secondPnLBefore = await getPlayerPnL(secondAddress);
                const firstEggBalanceBefore = await getEggBalance(firstAddress);
                const secondEggBalanceBefore = await getEggBalance(secondAddress);

                await broadcastTx(invokeScript(revealOrderTakerTx(order, TAKER_SALT), TAKER_SEED));

                const takerOrder = await getOrder(gameId, "taker");
                const firstCurrentGame = await getPlayerCurrentGame(firstAddress);
                const secondCurrentGame = await getPlayerCurrentGame(secondAddress);
                const firstDrawsAfter = await getPlayerDraws(firstAddress);
                const secondDrawsAfter = await getPlayerDraws(secondAddress);
                const firstResult = await getPlayerResult(gameId, firstAddress);
                const firstPrize = await getPlayerPrize(gameId, firstAddress);
                const secondResult = await getPlayerResult(gameId, secondAddress);
                const secondPrize = await getPlayerPrize(gameId, secondAddress);
                const firstPnLAfter = await getPlayerPnL(firstAddress);
                const secondPnLAfter = await getPlayerPnL(secondAddress);
                const firstEggBalanceAfter = await getEggBalance(firstAddress);
                const secondEggBalanceAfter = await getEggBalance(secondAddress);

                assert.equal(takerOrder, order);
                assert.equal(firstCurrentGame, 0);
                assert.equal(secondCurrentGame, 0);
                assert.equal(firstDrawsAfter, firstDrawsBefore + 1);
                assert.equal(secondDrawsAfter, secondDrawsBefore + 1);
                assert.equal(firstResult, "draw");
                assert.equal(secondResult, "draw");
                assert.equal(firstPrize, 0);
                assert.equal(secondPrize, 0);
                assert.equal(firstPnLAfter, firstPnLBefore);
                assert.equal(secondPnLAfter, secondPnLBefore);
                assert.equal(firstEggBalanceAfter - firstEggBalanceBefore, bet);
                assert.equal(secondEggBalanceAfter - secondEggBalanceBefore, bet);
            });
        }

        it("Taker can't reveal again", async function () {
            try {
                await broadcastTx(invokeScript(revealOrderTakerTx(order, TAKER_SALT), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Maker can't get prize", async function () {
            try {
                await broadcastTx(invokeScript(getPrizeExpiredTx(), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Taker can't get prize", async function () {
            try {
                await broadcastTx(invokeScript(getPrizeExpiredTx(), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });
    });
}
