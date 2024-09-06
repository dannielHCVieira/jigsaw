import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { JigsawDemoDescriptionModule } from "app/for-internal/description/demo-description";
import { JigsawButtonBarModule, JigsawButtonModule, JigsawHeaderModule, JigsawNumericInputModule, JigsawSwitchModule, JigsawSystemPromptModule, JigsawTextareaModule } from "jigsaw/public_api";
import { JigsawSystemPromptTrustedHtmlDemoComponent } from "./demo.component";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";

@NgModule({
    imports: [JigsawHeaderModule, CommonModule, JigsawDemoDescriptionModule, JigsawSystemPromptModule, JigsawButtonModule, PerfectScrollbarModule,
        JigsawNumericInputModule, JigsawSwitchModule, JigsawTextareaModule, JigsawButtonBarModule],
    declarations: [JigsawSystemPromptTrustedHtmlDemoComponent],
    exports: [JigsawSystemPromptTrustedHtmlDemoComponent]
})
export class JigsawSystemPromptTrustedHtmlDemoModule { }
