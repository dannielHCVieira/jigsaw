import {NgModule} from "@angular/core";
import {JigsawButtonModule, JigsawNumericInputModule, JigsawSwitchModule} from "jigsaw/public_api";
import {JigsawDemoDescriptionModule} from "app/for-internal/description/demo-description";
import {NumericInputPrecisionDemoComponent} from "./demo.component";

import {JigsawHeaderModule} from "jigsaw/public_api";

@NgModule({
    declarations: [NumericInputPrecisionDemoComponent],
    exports: [NumericInputPrecisionDemoComponent],
    imports: [JigsawNumericInputModule, JigsawDemoDescriptionModule, JigsawHeaderModule, JigsawButtonModule, JigsawSwitchModule]
})
export class NumericInputPrecisionDemoModule {

}
