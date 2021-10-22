import {
    RANDOMS1,
    RANDOMS2,
    TAKER_SALT,
    MAKER_SEED,
    TAKER_SEED,
} from "../../../src/settings";
import { makeGameTest } from "../makeGame.test";
import { takeGameTest } from "../takeGame.test";
import { revealRandomsAndReplaceMakerTest } from "../revealRandomsAndReplaceMaker.test";
import { commitOrderTakerTest } from "../commitOrderTaker.test";
import { setOrderMakerTest } from "../setOrderMaker.test";
import { revealOrderTakerTest } from "../revealOrderTaker.test";


describe('Taker wins. Replace', async function () {
    this.timeout(120000);

    makeGameTest(RANDOMS1, 2, 3, 4);
    takeGameTest(RANDOMS2, true);

    // Step1. Maker: 12|21|31, Taker: 17|26|33
    revealRandomsAndReplaceMakerTest(RANDOMS1, "", "", "", true);

    // Step2. Skipped

    // Step3. 17|26|33
    commitOrderTakerTest("worst|medium|best", TAKER_SALT);

    // Step4. 21|31|12
    setOrderMakerTest("medium|best|worst");

    // Step5. 21|31|12 vs 17|26|33 = 1|1|-1. Maker wins
    revealOrderTakerTest("worst|medium|best", "best|medium|worst",  MAKER_SEED, TAKER_SEED, false);
})
