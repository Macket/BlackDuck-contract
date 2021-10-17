import { assert } from 'chai';
import {invokeScript} from "@waves/waves-transactions";
import { address, TEST_NET_CHAIN_ID } from "@waves/ts-lib-crypto";
import {broadcastTx, generateCommit} from "../../src/sdk/utils";
import {
    commitTx,
    getPrizeTx,
    makeGameTx,
    pickDucksTx,
    revealTx,
    takeGameTx,
    wrongPickDucksTx
} from "../../src/sdk/gameTransactions";
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
    getTaker,
    getExpirationHeight,
    getRarity,
    getStep,
    getCommit,
    getGamesPlayed,
    getDuckOrder,
    getEggBalance,
    getPlayerWins,
    getPlayerLoses, getGameResult, getGamePrize,
} from "../../src/sdk/gameData";
import {
    MAKER_SEED,
    IMPOSTOR_SEED,
    WAITING,
    TAKER_SEED,
    STEP_DURATION,
    MAKER_WORST_DUCK,
    MAKER_MEDIUM_DUCK,
    MAKER_MEDIUM_DUCK2,
    MAKER_BEST_DUCK,
    EGG_ID,
    TAKER_WORST_DUCK,
    TAKER_MEDIUM_DUCK,
    TAKER_MEDIUM_DUCK_SAME_RARITY,
    TAKER_MEDIUM_DUCK2,
    TAKER_BEST_DUCK,
    MAKER_SALT,
    TAKER_SALT,
    IMPOSTOR_WORST_DUCK,
    IMPOSTOR_MEDIUM_DUCK,
    IMPOSTOR_MEDIUM_DUCK2,
    IMPOSTOR_BEST_DUCK,
} from "../../src/settings";

describe('One range test', function() {
    this.timeout(120000);
    const EGGs = 1;


    // ----------------- MAKE GAME -----------------


    it('Invalid slot revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx( 10, 1, 2, 3, EGGs), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid slot')
        }
    });

    it('Not 0.01 EGGs revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx( 0, 1, 2, 3, 2), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Bet must be 0.01 EGG during beta test')
        }
    });

    it('Invalid rarity range for the worst duck revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx(0,  0, 1, 2, EGGs), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid rarity range for the worst duck')
        }
    });

    it('Invalid rarity range for the medium duck revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx(0, 1, 6, 2, EGGs), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid rarity range for the medium duck')
        }
    });

    it('Invalid rarity range for the best duck revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx(0, 1, 2, 10, EGGs), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid rarity range for the best duck')
        }
    });

    it('Medium < worst revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx( 0, 2, 1, 3, EGGs), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "The medium range can't be less than the worst one")
        }
    });

    it('Best < medium revert', async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx( 0, 2, 2, 1, EGGs), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "The best range can't be worse than the medium one")
        }
    });


    it('Makes game', async function () {
        const gameId = await getNextGameId();
        const height = await getBlockHeight();

        await broadcastTx(invokeScript(makeGameTx(0, 2, 3, 3, EGGs), MAKER_SEED));

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
        assert.equal(betEggs, 1);
        assert.equal(worstRarityRange, 2);
        assert.equal(mediumRarityRange, 3);
        assert.equal(bestRarityRange, 3);
        assert.approximately(waitingExpirationHeight, height + WAITING, 1);
        assert.equal(gameId, slotGameId);
        assert.equal(gameId + 1, nextGameId);
    });

    it("Maker can't get prize when game is not started", async function () {
        try {
            await broadcastTx(invokeScript(getPrizeTx(), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Game is not started')
        }
    });

    it("Can't make another game", async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx( 1, 2, 3, 3, EGGs), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'You already have an active game')
        }
    });

    it("Can't occupy a busy slot", async function () {
        try {
            await broadcastTx(invokeScript(makeGameTx( 0, 2, 3, 3, EGGs), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'This slot is busy')
        }
    });


    // ----------------- TAKE GAME -----------------


    it('Invalid slot revert', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 11, EGGs), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid slot')
        }
    });

    it("Can't take game from empty slot", async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 9, EGGs), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'This slot is empty')
        }
    });

    // it('Not enough EGGs', async function () {
    //     try {
    //         await broadcastTx(invokeScript(takeGameTx( 0, EGGs - 1), TAKER_SEED));
    //     } catch (err) {
    //         assert.strictEqual(err.message.split(': ')[1], 'Insufficient eggs amount')
    //     }
    // });

    it('Too much EGGs', async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx( 0, EGGs + 1), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Insufficient eggs amount')
        }
    });

    it('Takes game', async function () {
        const height = await getBlockHeight();
        const gameId = await getSlot(0);
        const gamesPlayedBefore = await getGamesPlayed();

        await broadcastTx(invokeScript(takeGameTx(0, EGGs), TAKER_SEED));

        const currentPlayerGame = await getPlayerCurrentGame(address(TAKER_SEED, TEST_NET_CHAIN_ID));
        const playerRole = await getPlayerRole(gameId, address(TAKER_SEED, TEST_NET_CHAIN_ID));
        const takerAddress = await getTaker(gameId);
        const expirationHeight = await getExpirationHeight(gameId);
        const slotGameId = await getSlot(0);
        const gamesPlayedAfter = await getGamesPlayed();

        assert.equal(gameId, currentPlayerGame);
        assert.equal(playerRole, "taker");
        assert.equal(takerAddress, address(TAKER_SEED, TEST_NET_CHAIN_ID));
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
        assert.equal(slotGameId, 0);
        assert.equal(gamesPlayedBefore + 1, gamesPlayedAfter);
    });

    it("Can't get prize when game is not finished or expired", async function () {
        try {
            await broadcastTx(invokeScript(getPrizeTx(), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Game is not finished or expired')
        }
    });


    // ----------------- PICK DUCKS -----------------


    it("Impostor can't pick", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(IMPOSTOR_WORST_DUCK, IMPOSTOR_MEDIUM_DUCK, IMPOSTOR_MEDIUM_DUCK2), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
        }
    });

    it("Maker can't pick before taker", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(MAKER_WORST_DUCK, MAKER_MEDIUM_DUCK, MAKER_MEDIUM_DUCK2), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the taker's turn to pick now");
        }
    });

    it("Invalid asset revert", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(EGG_ID, TAKER_MEDIUM_DUCK, TAKER_MEDIUM_DUCK2), TAKER_SEED));
        } catch (err) {
            assert.isTrue(err.message.split(': ')[1].includes('not valid NFT'));
        }
    });

    it("Can't send 2 ducks", async function () {
        try {
            await broadcastTx(invokeScript(wrongPickDucksTx(TAKER_WORST_DUCK, TAKER_MEDIUM_DUCK), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "function 'pickDucks takes 3 args but 2 were(was) given");
        }
    });

    it("Taker can't play with alien duck", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(MAKER_WORST_DUCK, TAKER_MEDIUM_DUCK, TAKER_MEDIUM_DUCK2), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Asset " + MAKER_WORST_DUCK + " doesn't belong to you");
        }
    });

    it("Ducks of the same rarity can't play", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(TAKER_WORST_DUCK, TAKER_MEDIUM_DUCK, TAKER_MEDIUM_DUCK_SAME_RARITY), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Ducks must have different rarities");
        }
    });

    it("Can't use one duck twice", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(TAKER_WORST_DUCK, TAKER_MEDIUM_DUCK, TAKER_MEDIUM_DUCK), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Ducks must have different rarities");
        }
    });

    it("Taker picks duck", async function () {
        const height = await getBlockHeight();
        const gameId = await getPlayerCurrentGame(address(TAKER_SEED, TEST_NET_CHAIN_ID));

        await broadcastTx(invokeScript(pickDucksTx(TAKER_WORST_DUCK, TAKER_MEDIUM_DUCK, TAKER_MEDIUM_DUCK2), TAKER_SEED));

        const worstRarity = await getRarity(gameId, "taker", "worst");
        const mediumRarity = await getRarity(gameId, "taker", "medium");
        const bestRarity = await getRarity(gameId, "taker", "best");
        const gameStep = await getStep(gameId);
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(worstRarity, 13);
        assert.equal(mediumRarity, 27);
        assert.equal(bestRarity, 22);
        assert.equal(gameStep, 1);
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
    });

    it("Taker can't pick again", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(TAKER_WORST_DUCK, TAKER_MEDIUM_DUCK, TAKER_MEDIUM_DUCK2), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the maker's turn to pick now");
        }
    });

    it("Maker can't play with alien duck", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(MAKER_WORST_DUCK, MAKER_MEDIUM_DUCK, TAKER_MEDIUM_DUCK), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Asset " + TAKER_MEDIUM_DUCK + " doesn't belong to you");
        }
    });

    it("Maker picks duck", async function () {
        const height = await getBlockHeight();
        const gameId = await getPlayerCurrentGame(address(MAKER_SEED, TEST_NET_CHAIN_ID));

        await broadcastTx(invokeScript(pickDucksTx(MAKER_WORST_DUCK, MAKER_MEDIUM_DUCK, MAKER_MEDIUM_DUCK2), MAKER_SEED));

        const worstRarity = await getRarity(gameId, "maker", "worst");
        const mediumRarity = await getRarity(gameId, "maker", "medium");
        const bestRarity = await getRarity(gameId, "maker", "best");
        const gameStep = await getStep(gameId);
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(worstRarity, 13);
        assert.equal(mediumRarity, 22);
        assert.equal(bestRarity, 27);
        assert.equal(gameStep, 2);
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
    });

    it("Maker can't pick again", async function () {
        try {
            await broadcastTx(invokeScript(pickDucksTx(MAKER_WORST_DUCK, MAKER_MEDIUM_DUCK, MAKER_BEST_DUCK), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Ducks have already been picked");
        }
    });


    // ----------------- COMMIT -----------------

    it("Impostor can't commit", async function () {
        try {
            await broadcastTx(invokeScript(commitTx('worst,medium,best', MAKER_SALT), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
        }
    });

    it("Maker can't commit before taker", async function () {
        try {
            await broadcastTx(invokeScript(commitTx('worst,medium,best', MAKER_SALT), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the taker's turn to pick now");
        }
    });

    it('Taker commits', async function () {
        const takerAddress = address(TAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(takerAddress);
        const gameStepBefore = await getStep(gameId);
        const height = await getBlockHeight();

        assert.equal(gameStepBefore, 2);

        await broadcastTx(invokeScript(commitTx('worst,medium,best', TAKER_SALT), TAKER_SEED));

        const gameStepAfter = await getStep(gameId);
        const takerCommit = await getCommit(gameId, "taker");
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(gameStepAfter, 3);
        assert.equal(takerCommit, generateCommit('worst,medium,best', TAKER_SALT));
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
    });

    it("Taker can't commit again", async function () {
        try {
            await broadcastTx(invokeScript(commitTx("best,medium,worst", TAKER_SALT), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the maker's turn to pick now");
        }
    });

    it('Maker commits', async function () {
        const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(makerAddress);
        const gameStepBefore = await getStep(gameId);
        const height = await getBlockHeight();

        assert.equal(gameStepBefore, 3);

        await broadcastTx(invokeScript(commitTx('best,medium,worst', MAKER_SALT), MAKER_SEED));

        const gameStepAfter = await getStep(gameId);
        const makerCommit = await getCommit(gameId, "maker");
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(gameStepAfter, 4);
        assert.equal(makerCommit, generateCommit('best,medium,worst', MAKER_SALT));
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
    });

    it("Maker can't commit again", async function () {
        try {
            await broadcastTx(invokeScript(commitTx('worst,medium,best', MAKER_SALT), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Commit is finished");
        }
    });


    // ----------------- REVEAL -----------------


    it("Impostor can't reveal", async function () {
        try {
            await broadcastTx(invokeScript(revealTx('worst,medium,best', MAKER_SALT), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
        }
    });

    it("Maker can't reveal before taker", async function () {
        try {
            await broadcastTx(invokeScript(revealTx('worst,medium,best', MAKER_SALT), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the taker's turn to pick now");
        }
    });

    it("Invalid reveal revert", async function () {
        try {
            await broadcastTx(invokeScript(revealTx('best,medium,wor', TAKER_SALT), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Reveal data is not valid");
        }
    });

    it("Commit-reveal mismatch revert", async function () {
        try {
            await broadcastTx(invokeScript(revealTx('best,medium,worst', TAKER_SALT), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Reveal doesn't match commit");
        }
    });

    it('Taker reveals', async function () {
        const takerAddress = address(TAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(takerAddress);
        const gameStepBefore = await getStep(gameId);
        const height = await getBlockHeight();

        assert.equal(gameStepBefore, 4);

        await broadcastTx(invokeScript(revealTx('worst,medium,best', TAKER_SALT), TAKER_SEED));

        const gameStepAfter = await getStep(gameId);
        const takerDuckOrder = await getDuckOrder(gameId, "taker");
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(gameStepAfter, 5);
        assert.equal(takerDuckOrder, 'worst,medium,best');
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
    });

    it("Taker can't reveal again", async function () {
        try {
            await broadcastTx(invokeScript(revealTx("best,medium,worst", TAKER_SALT), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "It is the maker's turn to pick now");
        }
    });

    it('Maker reveals', async function () {
        const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(makerAddress);
        const gameStepBefore = await getStep(gameId);
        const height = await getBlockHeight();

        assert.equal(gameStepBefore, 5);

        await broadcastTx(invokeScript(revealTx('best,medium,worst', MAKER_SALT), MAKER_SEED));

        const gameStepAfter = await getStep(gameId);
        const makerDuckOrder = await getDuckOrder(gameId, "maker");
        const expirationHeight = await getExpirationHeight(gameId);

        assert.equal(gameStepAfter, 6);
        assert.equal(makerDuckOrder, 'best,medium,worst');
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
    });

    it("Maker can't reveal again", async function () {
        try {
            await broadcastTx(invokeScript(revealTx('worst,medium,best', MAKER_SALT), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Reveal is finished");
        }
    });

    // ----------------- GET PRIZE -----------------

    it("Impostor can't steal prize", async function () {
        try {
            await broadcastTx(invokeScript(getPrizeTx(), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game")
        }
    });

    it('Loser leaves the game', async function () {
        const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
        const eggBalanceBefore = await getEggBalance(makerAddress);
        const losesBefore = await getPlayerLoses(makerAddress);

        await broadcastTx(invokeScript(getPrizeTx(), MAKER_SEED));

        const currentMakerGame = await getPlayerCurrentGame(makerAddress);
        const eggBalanceAfter = await getEggBalance(makerAddress);
        const losesAfter = await getPlayerLoses(makerAddress);

        assert.equal(currentMakerGame, 0);
        assert.equal(eggBalanceAfter, eggBalanceBefore);
        assert.equal(losesBefore, losesAfter);
    });

    it("Loser can't leave game twice", async function () {
        try {
            await broadcastTx(invokeScript(getPrizeTx(), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game")
        }
    });

    it('Winner gets prize', async function () {
        const takerAddress = address(TAKER_SEED, TEST_NET_CHAIN_ID);
        const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
        const gameId = await getPlayerCurrentGame(takerAddress);
        const betEggs = await getBetEggs(gameId);
        const eggBalanceBefore = await getEggBalance(takerAddress);
        const winsBefore = await getPlayerWins(takerAddress);
        const losesBefore = await getPlayerLoses(makerAddress);

        await broadcastTx(invokeScript(getPrizeTx(), TAKER_SEED));

        const currentTakerGame = await getPlayerCurrentGame(takerAddress);
        const currentMakerGame = await getPlayerCurrentGame(makerAddress);
        const eggBalanceAfter = await getEggBalance(takerAddress);
        const winsAfter = await getPlayerWins(takerAddress);
        const losesAfter = await getPlayerLoses(makerAddress);
        const makerResult = await getGameResult(gameId, makerAddress);
        const makerPrize = await getGamePrize(gameId, makerAddress);
        const takerResult = await getGameResult(gameId, takerAddress);
        const takerPrize = await getGamePrize(gameId, takerAddress);

        assert.equal(currentTakerGame, 0);
        assert.equal(currentMakerGame, 0);
        assert.equal(eggBalanceAfter - eggBalanceBefore, betEggs * 2, "taker EGG balance");
        assert.equal(winsBefore + 1, winsAfter);
        assert.equal(losesBefore + 1, losesAfter);
        assert.equal(takerResult, "win", "taker result");
        assert.equal(takerPrize, betEggs, "taker prize");
        assert.equal(makerResult, "lose", "maker result");
        assert.equal(makerPrize, -betEggs, "maker prize");
    });

    it("Winner can't get prize twice", async function () {
        try {
            await broadcastTx(invokeScript(getPrizeTx(), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have an active game")
        }
    });
});
