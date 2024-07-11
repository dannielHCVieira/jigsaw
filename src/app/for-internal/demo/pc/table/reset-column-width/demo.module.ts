import { NgModule } from '@angular/core';
import { JigsawButtonModule, JigsawTableModule } from "jigsaw/public_api";
import { TableResetColumnWidthDemoComponent } from './demo.component';
import { JigsawDemoDescriptionModule } from "app/for-internal/description/demo-description";

@NgModule({
    imports: [
        JigsawTableModule,
        JigsawButtonModule,
        JigsawDemoDescriptionModule,
    ],
    declarations: [TableResetColumnWidthDemoComponent],
    exports: [TableResetColumnWidthDemoComponent],
})
export class TableResetColumnWidthDemoModule {}
