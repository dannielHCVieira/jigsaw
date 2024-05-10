import { NgModule } from "@angular/core";
import { JigsawNumericInputModule } from "jigsaw/public_api";
import { JigsawDemoDescriptionModule } from "app/for-internal/description/demo-description";
import { NumericInputNegativeValueDemoComponent } from "./demo.component";

import { JigsawHeaderModule } from "jigsaw/public_api";

@NgModule({
    declarations: [NumericInputNegativeValueDemoComponent],
    exports: [NumericInputNegativeValueDemoComponent],
    imports: [JigsawNumericInputModule, JigsawDemoDescriptionModule, JigsawHeaderModule]
})
export class NumericInputNegativeValueDemoModule {

}
