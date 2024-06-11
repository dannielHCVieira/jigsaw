import {NgModule} from '@angular/core';
import {JigsawButtonBarModule, JigsawHeaderModule, JigsawTabsModule} from "jigsaw/public_api";
import {JigsawDemoDescriptionModule} from "app/for-internal/description/demo-description";
import {DotBarDemoComponent} from './demo.component';
import {CommonModule} from "@angular/common";

@NgModule({
    imports: [
        JigsawTabsModule, JigsawDemoDescriptionModule, JigsawHeaderModule, CommonModule, JigsawButtonBarModule
    ],
    declarations: [DotBarDemoComponent],
    exports: [DotBarDemoComponent]
})
export class DotBarDemoModule {
}
