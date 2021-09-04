import { stringToBytes, sha256, base58Encode } from "@waves/ts-lib-crypto";
import { broadcast, waitForTx } from "@waves/waves-transactions";

export const broadcastTx = async (tx): Promise<void> => {
    await broadcast(tx, 'https://nodes-testnet.wavesnodes.com');
    await waitForTx(tx.id, { apiBase: 'https://nodes-testnet.wavesnodes.com' });
};

export type DUCKS_ORDER_TYPE = "worst,medium,best" | "worst,best,medium" | "medium,worst,best" | "medium,best,worst" | "best,worst,medium" | "best,medium,worst";

export const generateCommit = (duckOrder: DUCKS_ORDER_TYPE, salt: string): string => base58Encode(sha256(stringToBytes(duckOrder + salt)));
