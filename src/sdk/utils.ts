import { stringToBytes, sha256, base58Encode } from "@waves/ts-lib-crypto";
import { broadcast, waitForTx } from "@waves/waves-transactions";

export const broadcastTx = async (tx): Promise<void> => {
    await broadcast(tx, 'https://nodes-testnet.wavesnodes.com');
    await waitForTx(tx.id, { apiBase: 'https://nodes-testnet.wavesnodes.com' });
};

export const generateCommit = (secret: string): string => base58Encode(sha256(stringToBytes(secret)));

export const arrayItemAt = (arr: any[], index: number) => {
    const _index = index % arr.length;
    return arr.slice(_index, _index + 1)[0];
}