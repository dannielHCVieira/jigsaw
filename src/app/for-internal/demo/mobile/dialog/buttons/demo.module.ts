import {NgModule} from "@angular/core";
import {PopupService} from "jigsaw/mobile_public_api";
import {JigsawDemoDescriptionModule} from "app/for-internal/description/demo-description";
import {DialogButtonsDemo} from "./demo.component";
import {JigsawMobileButtonModule, JigsawMobileDialogModule} from "jigsaw/mobile_public_api";

@NgModule({
    declarations: [DialogButtonsDemo],
    exports: [DialogButtonsDemo],
    imports: [JigsawMobileDialogModule, JigsawMobileButtonModule, JigsawDemoDescriptionModule],
    providers: [PopupService]
})
export class DialogButtonsDemoModule {

}
