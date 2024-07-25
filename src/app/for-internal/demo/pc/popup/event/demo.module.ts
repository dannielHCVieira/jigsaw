import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {JigsawDemoDescriptionModule} from "app/for-internal/description/demo-description";
import {PopupServiceEventComponent} from "./demo.component";
import {JigsawRangeDateTimeSelectModule, PopupService} from "jigsaw/public_api";

@NgModule({
    declarations: [PopupServiceEventComponent],
    exports: [PopupServiceEventComponent],
    imports: [CommonModule, JigsawDemoDescriptionModule, JigsawRangeDateTimeSelectModule]
})
export class PopupServiceEventModule {
    constructor(private _popupService: PopupService) {
        this._popupService.popupStateChange.subscribe(state => {
            console.log(state);
        });
    }
}
