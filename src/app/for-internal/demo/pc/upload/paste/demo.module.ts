import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    JigsawUploadModule, JigsawSwitchModule, JigsawRadioLiteModule, JigsawButtonModule,
    JigsawLoadingModule, JigsawNumericInputModule, JigsawHeaderModule,
    JigsawTextareaModule,
    JigsawInputModule
} from "jigsaw/public_api";
import { JigsawDemoDescriptionModule } from "app/for-internal/description/demo-description";
import { UploadPasteDemoComponent } from "./demo.component";

@NgModule({
    declarations: [UploadPasteDemoComponent],
    exports: [UploadPasteDemoComponent],
    imports: [JigsawUploadModule, JigsawDemoDescriptionModule, JigsawSwitchModule,
        JigsawRadioLiteModule, JigsawButtonModule, JigsawLoadingModule, CommonModule,
        JigsawNumericInputModule, JigsawHeaderModule, JigsawTextareaModule, JigsawInputModule]
})
export class UploadPasteDemoModule {

}
