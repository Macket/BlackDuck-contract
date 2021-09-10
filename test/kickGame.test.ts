import { assert } from 'chai';
import { address, TEST_NET_CHAIN_ID } from '@waves/ts-lib-crypto';
import { invokeScript } from "@waves/waves-transactions";
import { broadcastTx } from "../src/sdk/utils";
import { kickGameTx } from "../src/sdk/gameTransactions";
import { getSlot, getPlayerCurrentGame } from "../src/sdk/gameData";
import { MAKER_SEED, IMPOSTOR_SEED } from "../src/settings";

describe('Kick Game', function() {
    this.timeout(120000);

    it("Kicks game", async function () {
        const slotGameBefore: number = await getSlot(0);
        const player1CurrentGameBefore: number = await getPlayerCurrentGame(address(MAKER_SEED, TEST_NET_CHAIN_ID));
        assert.isAbove(slotGameBefore, 0);
        assert.equal(player1CurrentGameBefore, slotGameBefore);

        await broadcastTx(invokeScript(kickGameTx(0), IMPOSTOR_SEED));

        const slotGameAfter: number = await getSlot(0);
        const player1CurrentGameAfter: number = await getPlayerCurrentGame(address(MAKER_SEED, TEST_NET_CHAIN_ID));
        assert.equal(slotGameAfter, 0);
        assert.equal(player1CurrentGameAfter, slotGameAfter);
    });

    it("Can't kick from empty slot", async function () {
        try {
            await broadcastTx(invokeScript(kickGameTx(9), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Slot is empty')
        }
    });

    it("Can't kick from invalid slot", async function () {
        try {
            await broadcastTx(invokeScript(kickGameTx(11), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Invalid slot')
        }
    });

    it("Can't kick not expired game", async function () {
        try {
            await broadcastTx(invokeScript(kickGameTx(0), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Waiting is not finished yet')
        }
    });
});
