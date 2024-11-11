import {NgModule} from '@angular/core';
import {JigsawButtonModule, JigsawInputModule, JigsawSelectModule,JigsawSwitchModule} from "jigsaw/public_api";
import {JigsawDemoDescriptionModule} from "app/for-internal/description/demo-description";
import {SelectSearchableDemoComponent} from './demo.component';
import {JigsawHeaderModule} from "jigsaw/public_api";

@NgModule({
    imports: [JigsawSelectModule, JigsawButtonModule, JigsawDemoDescriptionModule, JigsawHeaderModule, JigsawInputModule,JigsawSwitchModule],
    declarations: [SelectSearchableDemoComponent],
    exports: [SelectSearchableDemoComponent]
})
export class SelectSearchableDemoModule {
}
