import { assert } from 'chai';
import { address, TEST_NET_CHAIN_ID } from '@waves/ts-lib-crypto';
import { invokeScript } from "@waves/waves-transactions";
import { broadcastTx } from "../../src/sdk/utils";
import { kickGameTx } from "../../src/sdk/v1/gameTransactions";
import { getSlot, getPlayerCurrentGame } from "../../src/sdk/v1/gameData";
import { MAKER_SEED, IMPOSTOR_SEED } from "../../src/settings";

describe('Kick Game', function() {
    this.timeout(120000);

    it("Kicks game", async function () {
        const slotGameBefore: number = await getSlot(0);
        const makerCurrentGameBefore: number = await getPlayerCurrentGame(address(MAKER_SEED, TEST_NET_CHAIN_ID));
        assert.isAbove(slotGameBefore, 0);
        assert.equal(makerCurrentGameBefore, slotGameBefore);

        await broadcastTx(invokeScript(kickGameTx(0), IMPOSTOR_SEED));

        const slotGameAfter: number = await getSlot(0);
        const makerCurrentGameAfter: number = await getPlayerCurrentGame(address(MAKER_SEED, TEST_NET_CHAIN_ID));
        assert.equal(slotGameAfter, 0);
        assert.equal(makerCurrentGameAfter, 0);
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
