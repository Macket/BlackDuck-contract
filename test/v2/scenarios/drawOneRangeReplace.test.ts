import {
    RANDOMS1,
    RANDOMS2,
    MAKER_WORST_DUCK,
    MAKER_BEST_DUCK,
    TAKER_MEDIUM_DUCK,
    TAKER_WORST_DUCK,
    TAKER_SALT,
    MAKER_SEED,
    TAKER_SEED,
} from "../../../src/settings";
import { makeGameTest } from "../makeGame.test";
import { takeGameTest } from "../takeGame.test";
import { replaceMakerTest } from "../replaceMaker.test";
import { replaceTakerTest } from "../replaceTaker.test";
import { commitOrderTakerTest } from "../commitOrderTaker.test";
import { setOrderMakerTest } from "../setOrderMaker.test";
import { revealOrderTakerTest } from "../revealOrderTaker.test";


describe('Draw. One Range. Replace', async function () {
    this.timeout(120000);

    makeGameTest(RANDOMS1, 2, 2, 2);
    takeGameTest(RANDOMS2, false);

    // Step1. Maker: 12|18|13(r), Taker: 17|14|17
    replaceMakerTest(RANDOMS1, 3, MAKER_WORST_DUCK, MAKER_BEST_DUCK, false);

    // Step2. Taker replaces 14 with 13. Now Maker: 12|18|13(r), Taker: 17|13(r)|17
    replaceTakerTest(2, TAKER_WORST_DUCK, TAKER_MEDIUM_DUCK);

    // Step3. 17|13|17
    commitOrderTakerTest("1|2|3", TAKER_SALT);

    // Step4. 12|13|18
    setOrderMakerTest("1|3|2");

    // Step5. 12|13|18 vs 17|13|17 = -1|0|1. Draw
    revealOrderTakerTest("1|2|3", "3|2|1",  TAKER_SEED, MAKER_SEED, true);
})
