import { assert } from 'chai';
import { invokeScript } from "@waves/waves-transactions";
import {broadcastTx, generateCommit} from "../../src/sdk/utils";
import {
    makeGameTx,
    startTournamentTx,
} from "../../src/sdk/tournament/transactions";
import { getTournamentStartHeight, getTournamentFinishHeight, getBlockHeight } from "../../src/sdk/tournament/data";
import {MAKER_SEED, TAKER_SEED, IMPOSTOR_SEED, TOURNAMENT_ADMIN_SEED, RANDOMS1} from "../../src/settings";

describe('Start tournament', function() {
    this.timeout(120000);
    const BET = 5000000;

    it("Tournament is not started", async function () {
        const startHeight = await getTournamentStartHeight();
        const finishHeight = await getTournamentFinishHeight();
        assert.equal(startHeight, 0);
        assert.equal(finishHeight, 0);

        try {
            await broadcastTx(invokeScript(
                makeGameTx(10, 2, 3, 4, generateCommit(RANDOMS1), BET), MAKER_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Tournament is not started');
        }
    });

    it("No ticket (before start)", async function () {
        const startHeight = await getTournamentStartHeight();
        const finishHeight = await getTournamentFinishHeight();
        assert.equal(startHeight, 0);
        assert.equal(finishHeight, 0);

        try {
            await broadcastTx(invokeScript(
                makeGameTx(10, 2, 3, 4, generateCommit(RANDOMS1), BET), IMPOSTOR_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have a ticket");
        }
    });

    it("Impostor can't start tournament", async function () {
        try {
            await broadcastTx(invokeScript(startTournamentTx(), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Admin only');
        }
    });

    it("Start tournament", async function () {
        const startHeight = await getTournamentStartHeight();
        const finishHeight = await getTournamentFinishHeight();
        assert.equal(startHeight, 0);
        assert.equal(finishHeight, 0);

        await broadcastTx(invokeScript(startTournamentTx(), TOURNAMENT_ADMIN_SEED));

        const startHeightAfter = await getTournamentStartHeight();
        const finishHeightAfter = await getTournamentFinishHeight();
        const currentHeight = await getBlockHeight();
        assert.equal(startHeightAfter, currentHeight);
        assert.equal(finishHeightAfter, currentHeight + 20); // MIGHT CHANGE!!!
    });

    it("Can't start again", async function () {
        try {
            await broadcastTx(invokeScript(startTournamentTx(), TOURNAMENT_ADMIN_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Already started');
        }
    });

    it("No ticket (after start)", async function () {
        const startHeight = await getTournamentStartHeight();
        const finishHeight = await getTournamentFinishHeight();
        assert.isAbove(startHeight, 0);
        assert.isAbove(finishHeight, 0);

        try {
            await broadcastTx(invokeScript(
                makeGameTx(10, 2, 3, 4, generateCommit(RANDOMS1), BET), IMPOSTOR_SEED)
            );
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], "You don't have a ticket");
        }
    });
});
