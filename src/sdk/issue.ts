import { issue, broadcast, waitForTx }  from '@waves/waves-transactions'
import { MAKER_SEED } from "../settings";

const issueTx = issue({
    name: 'EGGs',
    description: 'Test EGGs',
    quantity: 10000000,
    decimals: 2,
    reissuable: true,
    chainId: 'T'
}, MAKER_SEED);

(async () => {
    await broadcast(issueTx, 'https://nodes-testnet.wavesnodes.com');
    console.log('Transaction:', issueTx);
    await waitForTx(issueTx.id, {});
    // console.log('Transaction is in the blockchain: ', startDuckHatchingTx.id);
})();
