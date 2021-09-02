import { stringToBytes, sha256, base58Encode } from "@waves/ts-lib-crypto";
import { broadcast, waitForTx } from "@waves/waves-transactions";

export const broadcastTx = async (tx): Promise<string> => {
    await broadcast(tx, 'https://nodes-testnet.wavesnodes.com');
    console.log('Transaction:', tx);
    await waitForTx(tx.id, { apiBase: 'https://nodes-testnet.wavesnodes.com' });
    console.log('Transaction is in the blockchain: ', tx.id);
    return tx.id
};

export type DUCKS_ORDER_TYPE = "worst,medium,best" | "worst,best,medium" | "medium,worst,best" | "medium,best,worst" | "best,worst,medium" | "best,medium,worst";

export const generateCommit = (duckOrder: DUCKS_ORDER_TYPE, salt: string): string => base58Encode(sha256(stringToBytes(duckOrder + salt)));
