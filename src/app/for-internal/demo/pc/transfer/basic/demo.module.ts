import { NgModule } from "@angular/core";
import { JigsawTransferModule, JigsawButtonModule, JigsawHeaderModule, JigsawSelectModule} from "jigsaw/public_api";
import { JigsawDemoDescriptionModule } from "app/for-internal/description/demo-description";
import { TransferArrayDemoComponent } from "./demo.component";

@NgModule({
    declarations: [TransferArrayDemoComponent],
    exports: [TransferArrayDemoComponent],
    imports: [JigsawDemoDescriptionModule, JigsawTransferModule, JigsawHeaderModule,
        JigsawButtonModule, JigsawSelectModule]
})
export class TransferArrayDemoModule {

}
