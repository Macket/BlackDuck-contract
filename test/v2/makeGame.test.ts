import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import { broadcastTx, generateCommit } from "../../src/sdk/utils";
import {
    makeGameTx,
    takeGameTx,
    replaceMakerTx,
    replaceTakerTx,
    commitOrderTakerTx,
    setOrderMakerTx,
    revealOrderTakerTx,
    getPrizeExpiredTx,
} from "../../src/sdk/v2/gameTransactions";
import {
    getNextGameId,
    getBlockHeight,
    getPlayerCurrentGame,
    getPlayerRole,
    getMaker,
    getBet,
    getRanges,
    getMakerRandomsCommit,
    getSlot,
    getWaitingExpirationHeight,
} from "../../src/sdk/v2/gameData";
import {
    MAKER_SEED,
    TAKER_SEED,
    IMPOSTOR_SEED,
    WAITING,
    TAKER_SALT,
    EGG_ID,
    WRONG_ASSET_ID,
    MAKER_MEDIUM_DUCK,
    TAKER_MEDIUM_DUCK,
} from "../../src/settings";

export const makeGameTest = (randoms: string, worstRange: number, mediumRange: number, bestRange: number) => {
    describe('Make Game', function () {
        this.timeout(120000);
        const BET = 10000;

        it('Invalid slot revert', async function () {
            try {
                await broadcastTx(invokeScript(
                    makeGameTx(10, worstRange, mediumRange, bestRange, generateCommit(randoms), BET), MAKER_SEED)
                );
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid slot')
            }
        });

        it('Invalid bet asset revert', async function () {
            try {
                await broadcastTx(invokeScript(
                    makeGameTx(0, worstRange, mediumRange, bestRange, generateCommit(randoms), 1, WRONG_ASSET_ID), MAKER_SEED)
                );
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You can attach only EGGs with the following asset id - " + EGG_ID)
            }
        });

        it('Invalid bet amount revert (ONLY BETA!!!)', async function () {
            try {
                await broadcastTx(invokeScript(
                    makeGameTx(0, worstRange, mediumRange, bestRange, generateCommit(randoms), BET + 1), MAKER_SEED)
                );
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Bet must be 0.0001 EGG during beta test")
            }
        });

        it('Invalid range for the worst duck revert', async function () {
            try {
                await broadcastTx(invokeScript(
                    makeGameTx(0, 0, 2, 3, generateCommit(randoms), BET), MAKER_SEED)
                );
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid range for the worst duck')
            }
        });

        it('Invalid range for the medium duck revert', async function () {
            try {
                await broadcastTx(invokeScript(
                    makeGameTx(0, 1, 6, 3, generateCommit(randoms), BET), MAKER_SEED)
                );
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid range for the medium duck')
            }
        });

        it('Invalid range for the best duck revert', async function () {
            try {
                await broadcastTx(invokeScript(
                    makeGameTx(0, 1, 2, 10, generateCommit(randoms), BET), MAKER_SEED)
                );
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid range for the best duck')
            }
        });

        it('Medium < worst revert', async function () {
            try {
                await broadcastTx(invokeScript(
                    makeGameTx(0, 2, 1, 3, generateCommit(randoms), BET), MAKER_SEED)
                );
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "The medium range can't be less than the worst one")
            }
        });

        it('Best < medium revert', async function () {
            try {
                await broadcastTx(invokeScript(
                    makeGameTx(0, 2, 2, 1, generateCommit(randoms), BET), MAKER_SEED)
                );
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "The best range can't be worse than the medium one")
            }
        });


        it('Makes game', async function () {
            const gameId = await getNextGameId();
            const height = await getBlockHeight();

            await broadcastTx(invokeScript(
                makeGameTx(0, worstRange, mediumRange, bestRange, generateCommit(randoms), BET), MAKER_SEED)
            );

            const currentPlayerGame = await getPlayerCurrentGame(address(MAKER_SEED, TEST_NET_CHAIN_ID));
            const makerAddress = await getMaker(gameId);
            const playerRole = await getPlayerRole(gameId, address(MAKER_SEED, TEST_NET_CHAIN_ID));
            const bet = await getBet(gameId);
            const [worstRangeStored, mediumRangeStored, bestRangeStored] = (await getRanges(gameId)).split("|").map(Number);
            const makerRandomsCommit = await getMakerRandomsCommit(gameId);
            const waitingExpirationHeight = await getWaitingExpirationHeight(gameId);
            const slotGameId = await getSlot(0);
            const nextGameId = await getNextGameId();

            assert.equal(gameId, currentPlayerGame);
            assert.equal(playerRole, "maker");
            assert.equal(makerAddress, address(MAKER_SEED, TEST_NET_CHAIN_ID));
            assert.equal(bet, BET);
            assert.equal(worstRangeStored, worstRange);
            assert.equal(mediumRangeStored, mediumRange);
            assert.equal(bestRangeStored, bestRange);
            assert.equal(makerRandomsCommit, generateCommit(randoms))
            assert.approximately(waitingExpirationHeight, height + WAITING, 1);
            assert.equal(gameId, slotGameId);
            assert.equal(gameId + 1, nextGameId);
        });

        it("Can't make another game", async function () {
            try {
                await broadcastTx(invokeScript(
                    makeGameTx(0, worstRange, mediumRange, bestRange, generateCommit(randoms), BET), MAKER_SEED)
                );
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'You already have an active game')
            }
        });

        it("Can't occupy a busy slot", async function () {
            try {
                await broadcastTx(invokeScript(
                    makeGameTx(0, worstRange, mediumRange, bestRange, generateCommit(randoms), BET), IMPOSTOR_SEED)
                );
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'This slot is busy')
            }
        });

        it("Maker can't take his own game", async function () {
            const randomsArr = randoms.split("|").map(Number)
            
            try {
                await broadcastTx(invokeScript(takeGameTx(
                    0,
                    randomsArr[0],
                    randomsArr[1],
                    randomsArr[2],
                    randomsArr[3],
                    randomsArr[4],
                    randomsArr[5],
                    false,
                    BET),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'You already have an active game')
            }
        });

        it("Maker can't reveal randoms and replace duck", async function () {
            const randomsArr = randoms.split("|").map(Number)

            try {
                await broadcastTx(invokeScript(replaceMakerTx(
                    randomsArr[0],
                    randomsArr[1],
                    randomsArr[2],
                    randomsArr[3],
                    randomsArr[4],
                    randomsArr[5],
                    2,
                    MAKER_MEDIUM_DUCK),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Game is not started");
            }
        });

        it("Taker can't reveal randoms and replace duck (maker method)", async function () {
            const randomsArr = randoms.split("|").map(Number)

            try {
                await broadcastTx(invokeScript(replaceMakerTx(
                    randomsArr[0],
                    randomsArr[1],
                    randomsArr[2],
                    randomsArr[3],
                    randomsArr[4],
                    randomsArr[5],
                    2,
                    TAKER_MEDIUM_DUCK),
                    TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Maker can't replace duck (taker method)", async function () {
            try {
                await broadcastTx(invokeScript(replaceTakerTx(2, MAKER_MEDIUM_DUCK), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Only taker can call this method");
            }
        });

        it("Taker can't replace duck", async function () {
            try {
                await broadcastTx(invokeScript(replaceTakerTx(2, TAKER_MEDIUM_DUCK), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Maker can't commit order (taker method)", async function () {
            try {
                await broadcastTx(invokeScript(commitOrderTakerTx(generateCommit('1|2|3' + TAKER_SALT)), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Only taker can call this method");
            }
        });

        it("Taker can't commit order", async function () {
            try {
                await broadcastTx(invokeScript(commitOrderTakerTx(generateCommit('1|2|3' + TAKER_SALT)), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Maker can't set order", async function () {
            try {
                await broadcastTx(invokeScript(setOrderMakerTx("3|2|1"), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "This step is not started");
            }
        });

        it("Taker can't set order (maker method)", async function () {
            try {
                await broadcastTx(invokeScript(setOrderMakerTx("3|2|1"), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Maker can't reveal order (taker method)", async function () {
            try {
                await broadcastTx(invokeScript(revealOrderTakerTx('1|2|3', TAKER_SALT), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Only taker can call this method");
            }
        });

        it("Taker can't reveal order", async function () {
            try {
                await broadcastTx(invokeScript(revealOrderTakerTx('1|2|3', TAKER_SALT), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Maker can't get prize", async function () {
            try {
                await broadcastTx(invokeScript(getPrizeExpiredTx(), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Game is not started");
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