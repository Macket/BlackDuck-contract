import { assert } from 'chai';
import { address, TEST_NET_CHAIN_ID } from '@waves/ts-lib-crypto';
import { invokeScript } from "@waves/waves-transactions";
import {broadcastTx, generateCommit} from "../../src/sdk/utils";
import {
    makeGameTx,
    takeGameTx,
} from "../../src/sdk/tournament/transactions";
import {
    getBlockHeight,
    getBet,
    getMaker,
    getMakerRandomsCommit,
    getNextGameId,
    getPlayerCurrentGame,
    getPlayerRole,
    getRanges,
    getSlot,
    getWaitingExpirationHeight,
    getExpirationHeight,
    getGamesPlayed,
    getRandoms,
    getStep,
    getTaker,
    getTakerSkipReplace,
} from "../../src/sdk/tournament/data";
import {
    MAKER_SEED,
    TAKER_SEED,
    IMPOSTOR_SEED,
    TOURNAMENT_ADMIN_SEED,
    RANDOMS1,
    RANDOMS2,
    WAITING,
    STEP_DURATION
} from "../../src/settings";


describe('Play tournament', function() {
    this.timeout(120000);
    const WARMUP_BET = 5000000;
    const MAIN_BET = 20000000;
    const CLUTCH_BET = 50000000;
    const BET = WARMUP_BET;
    const WRONG_BET = MAIN_BET;
    const takerRandoms: number[] = RANDOMS2.split("|").map(Number);

    it('Wrong bet amount', async function () {
        try {
            await broadcastTx(invokeScript(
                makeGameTx(0, 2, 3, 4, generateCommit(RANDOMS1), WRONG_BET), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "Wrong bet amount")
        }
    });

    it('Makes game', async function () {
        const gameId = await getNextGameId();
        const height = await getBlockHeight();

        await broadcastTx(invokeScript(
            makeGameTx(0, 2, 3, 4, generateCommit(RANDOMS1), BET), MAKER_SEED)
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
        assert.equal(worstRangeStored, 2);
        assert.equal(mediumRangeStored, 3);
        assert.equal(bestRangeStored, 4);
        assert.equal(makerRandomsCommit, generateCommit(RANDOMS1))
        assert.approximately(waitingExpirationHeight, height + WAITING, 1);
        assert.equal(gameId, slotGameId);
        assert.equal(gameId + 1, nextGameId);
    });

    it("Impostor can't take", async function () {
        try {
            await broadcastTx(invokeScript(takeGameTx(
                0,
                takerRandoms[0],
                takerRandoms[1],
                takerRandoms[2],
                takerRandoms[3],
                takerRandoms[4],
                takerRandoms[5],
                true,
                BET),
                IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have a ticket");
        }
    });

    it('Takes game', async function () {
        const height = await getBlockHeight();
        const gamesPlayedBefore = await getGamesPlayed();
        const gameId = await getSlot(0);

        await broadcastTx(invokeScript(takeGameTx(
            0,
            takerRandoms[0],
            takerRandoms[1],
            takerRandoms[2],
            takerRandoms[3],
            takerRandoms[4],
            takerRandoms[5],
            true,
            BET),
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
        assert.equal(takerRandomsStored, RANDOMS2);
        assert.equal(takerSkipReplace, true);
        assert.equal(step, 1);
        assert.approximately(expirationHeight, height + STEP_DURATION, 1);
        assert.equal(slotGameId, 0);
        assert.equal(gamesPlayedBefore, gamesPlayedAfter - 1);
    });
});
