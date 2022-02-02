import { assert } from 'chai';
import { address, TEST_NET_CHAIN_ID } from '@waves/ts-lib-crypto';
import { invokeScript } from "@waves/waves-transactions";
import { broadcastTx } from "../../src/sdk/utils";
import { getTicketTx, stopTicketsDistributionTx } from "../../src/sdk/tournament/transactions";
import { getHasTicket, getIsTicketsDistributionOver } from "../../src/sdk/tournament/data";
import { MAKER_SEED, TAKER_SEED, IMPOSTOR_SEED, TOURNAMENT_ADMIN_SEED } from "../../src/settings";

describe('Get ticket', function() {
    this.timeout(120000);

    it("Maker gets a ticket", async function () {
        const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
        const hasTicket: boolean = await getHasTicket(makerAddress);
        assert.equal(hasTicket, false);

        await broadcastTx(invokeScript(getTicketTx(), MAKER_SEED));

        const hasTicketAfter: boolean = await getHasTicket(makerAddress);
        assert.equal(hasTicketAfter, true);
    });

    it("Taker gets a ticket", async function () {
        const takerAddress = address(TAKER_SEED, TEST_NET_CHAIN_ID);
        const hasTicket: boolean = await getHasTicket(takerAddress);
        assert.equal(hasTicket, false);

        await broadcastTx(invokeScript(getTicketTx(), TAKER_SEED));

        const hasTicketAfter: boolean = await getHasTicket(takerAddress);
        assert.equal(hasTicketAfter, true);
    });

    it("Maker already has a ticket", async function () {
        const makerAddress = address(MAKER_SEED, TEST_NET_CHAIN_ID);
        const hasTicket: boolean = await getHasTicket(makerAddress);
        assert.equal(hasTicket, true);

        try {
            await broadcastTx(invokeScript(getTicketTx(), MAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'You already have a ticket')
        }
    });

    it("Taker already has a ticket", async function () {
        const takerAddress = address(TAKER_SEED, TEST_NET_CHAIN_ID);
        const hasTicket: boolean = await getHasTicket(takerAddress);
        assert.equal(hasTicket, true);

        try {
            await broadcastTx(invokeScript(getTicketTx(), TAKER_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'You already have a ticket');
        }
    });

    it("Impostor can't stop tickets distribution", async function () {
        try {
            await broadcastTx(invokeScript(stopTicketsDistributionTx(), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Admin only');
        }
    });

    it("Admin stops tickets distribution", async function () {
        const isTicketsDistributionOver: boolean = await getIsTicketsDistributionOver();
        assert.equal(isTicketsDistributionOver, false);

        await broadcastTx(invokeScript(stopTicketsDistributionTx(), TOURNAMENT_ADMIN_SEED));

        const isTicketsDistributionOverAfter: boolean = await getIsTicketsDistributionOver();
        assert.equal(isTicketsDistributionOverAfter, true);
    });

    it("Tickets distribution is over", async function () {
        const impostorAddress = address(IMPOSTOR_SEED, TEST_NET_CHAIN_ID);
        const hasTicket: boolean = await getHasTicket(impostorAddress);
        const isTicketsDistributionOverAfter: boolean = await getIsTicketsDistributionOver();
        assert.equal(isTicketsDistributionOverAfter, true);
        assert.equal(hasTicket, false);

        try {
            await broadcastTx(invokeScript(getTicketTx(), IMPOSTOR_SEED));
        } catch (err) {
            assert.strictEqual(err.message.split(': ')[1], 'Tickets distribution is over');
        }
    });
});
