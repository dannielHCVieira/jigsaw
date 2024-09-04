import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {JigsawFloatModule, JigsawHeaderModule, JigsawSwitchModule} from "jigsaw/public_api";
import {JigsawDemoDescriptionModule} from "app/for-internal/description/demo-description";
import {FloatStopPropagationDemo} from './demo.component';

@NgModule({
    imports: [
        CommonModule, JigsawDemoDescriptionModule, JigsawFloatModule, JigsawHeaderModule,
        JigsawSwitchModule
    ],
    declarations: [FloatStopPropagationDemo],
    exports: [FloatStopPropagationDemo]
})
export class FloatStopPropagationModule {
}
