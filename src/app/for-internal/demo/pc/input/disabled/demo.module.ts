import {NgModule} from "@angular/core";
import {JigsawHeaderModule, JigsawInputModule, JigsawSwitchModule} from "jigsaw/public_api";
import {JigsawDemoDescriptionModule} from "app/for-internal/description/demo-description";
import {InputDisabledComponent} from "./demo.component";

@NgModule({
    declarations: [InputDisabledComponent],
    exports: [InputDisabledComponent],
    imports: [JigsawInputModule, JigsawSwitchModule, JigsawDemoDescriptionModule, JigsawHeaderModule]
})
export class InputDisabledModule {
}
