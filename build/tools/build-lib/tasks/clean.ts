import { buildConfig } from '../util/build-config';
import {removeDirOrFile, removeFiles} from "../util/file";

export function cleanDist() {
    console.log(`----- Run Task: clean:dist -----`);
    return removeDirOrFile(buildConfig.outputDir);
}

export function cleanExtraction() {
    console.log(`----- Run Task: clean:extraction -----`);
    return removeFiles('src/jigsaw/common/core/theming/prebuilt/extraction/*.scss');
}

export function cleanAll() {
    cleanDist();
    cleanExtraction();
}

