import {NgModule} from '@angular/core';
import {JigsawButtonModule, JigsawTableModule} from "jigsaw/public_api";
import {TableChangeRenderDemoComponent} from './demo.component';
import {JigsawDemoDescriptionModule} from "app/for-internal/description/demo-description";

@NgModule({
    imports: [JigsawTableModule, JigsawButtonModule, JigsawDemoDescriptionModule],
    declarations: [TableChangeRenderDemoComponent],
    exports: [TableChangeRenderDemoComponent]
})
export class TableChangeRenderDemoModule {
}
