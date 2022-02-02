import { IInvokeScriptParams } from "@waves/waves-transactions";
import { EGG_ID, TOURNAMENT_TICKETS_ADDRESS, CHAIN_ID } from "../../settings";

export const getTicketTx = (): IInvokeScriptParams => ({
    dApp: TOURNAMENT_TICKETS_ADDRESS,
    fee: 500000,
    call: {
        function: "getTicket",
        args: [],
    },
    payment: [{
        assetId: EGG_ID,
        amount: 100000000,
    }],
    chainId: CHAIN_ID,
});

export const stopTicketsDistributionTx = (): IInvokeScriptParams => ({
    dApp: TOURNAMENT_TICKETS_ADDRESS,
    fee: 500000,
    call: {
        function: "stop",
        args: [],
    },
    payment: [],
    chainId: CHAIN_ID,
});
