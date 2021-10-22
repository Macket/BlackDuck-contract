import {
    RANDOMS1,
    RANDOMS2,
    MAKER_MEDIUM_DUCK,
    MAKER_BEST_DUCK,
    TAKER_MEDIUM_DUCK,
    TAKER_BEST_DUCK,
    TAKER_SALT,
    MAKER_SEED,
    TAKER_SEED,
} from "../../../src/settings";
import { makeGameTest } from "../makeGame.test";
import { takeGameTest } from "../takeGame.test";
import { revealRandomsAndReplaceMakerTest } from "../revealRandomsAndReplaceMaker.test";
import { replaceTakerTest } from "../replaceTaker.test";
import { commitOrderTakerTest } from "../commitOrderTaker.test";
import { setOrderMakerTest } from "../setOrderMaker.test";
import { revealOrderTakerTest } from "../revealOrderTaker.test";


describe('Taker wins. Replace', async function () {
    this.timeout(120000);

    makeGameTest(RANDOMS1, 2, 3, 4);
    takeGameTest(RANDOMS2, false);

    // Step1. Maker: 12|22(r)|31, Taker: 17|26|33
    revealRandomsAndReplaceMakerTest(RANDOMS1, "medium", MAKER_MEDIUM_DUCK, MAKER_BEST_DUCK, true);

    // Step2. Taker replaces 33 with 37. Now Maker: 12|22(r)|31, Taker: 17|26|37(r)
    replaceTakerTest("best", TAKER_BEST_DUCK, TAKER_MEDIUM_DUCK);

    // Step3. 17|26|37
    commitOrderTakerTest("worst|medium|best", TAKER_SALT);

    // Step4. 31|22|12
    setOrderMakerTest("best|medium|worst");

    // Step5. 31|22|12 vs 17|26|37 = 1|-1|-1. Taker wins
    revealOrderTakerTest("worst|medium|best", "best|medium|worst",  TAKER_SEED, MAKER_SEED, false);
})
