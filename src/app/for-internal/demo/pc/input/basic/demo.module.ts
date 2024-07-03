import {NgModule} from "@angular/core";
import {JigsawInputModule, JigsawHeaderModule, JigsawNumericInputModule} from "jigsaw/public_api";
import {InputBasicDemoComponent} from "./demo.component";
import {JigsawDemoDescriptionModule} from "app/for-internal/description/demo-description";

@NgModule({
    declarations: [InputBasicDemoComponent],
    exports: [InputBasicDemoComponent],
    imports: [JigsawInputModule, JigsawDemoDescriptionModule, JigsawNumericInputModule, JigsawHeaderModule]
})
export class InputBasicDemoModule {

}
