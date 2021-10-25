import {
    RANDOMS1,
    RANDOMS2,
    TAKER_SALT,
    MAKER_SEED,
    TAKER_SEED, TAKER_BEST_DUCK, TAKER_MEDIUM_DUCK,
} from "../../../src/settings";
import { makeGameTest } from "../makeGame.test";
import { takeGameTest } from "../takeGame.test";
import { replaceMakerTest } from "../replaceMaker.test";
import { replaceTakerTest } from "../replaceTaker.test";
import { commitOrderTakerTest } from "../commitOrderTaker.test";
import { setOrderMakerTest } from "../setOrderMaker.test";
import { revealOrderTakerTest } from "../revealOrderTaker.test";


describe('Maker wins. No replace', async function () {
    this.timeout(120000);

    makeGameTest(RANDOMS1, 2, 3, 4);
    takeGameTest(RANDOMS2, true);

    // Step1. Maker: 12|21|31, Taker: 17|26|33
    replaceMakerTest(RANDOMS1, 0, "", "", true);

    // Step2. Skipped
    // replaceTakerTest(0, "", "");

    // Step3. 17|26|33
    commitOrderTakerTest("1|2|3", TAKER_SALT);

    // Step4. 21|31|12
    setOrderMakerTest("2|3|1");

    // Step5. 21|31|12 vs 17|26|33 = 1|1|-1. Maker wins
    revealOrderTakerTest("1|2|3", "3|2|1",  MAKER_SEED, TAKER_SEED, false);
})
