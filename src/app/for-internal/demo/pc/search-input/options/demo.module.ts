import { NgModule } from "@angular/core";
import { JigsawDemoDescriptionModule } from "app/for-internal/description/demo-description";
import { SearchInputOptionsDemoComponent } from "./demo.component";
import { JigsawSearchInputModule, JigsawHeaderModule, JigsawButtonModule, JigsawSwitchModule } from "jigsaw/public_api";

@NgModule({
    declarations: [SearchInputOptionsDemoComponent],
    exports: [SearchInputOptionsDemoComponent],
    imports: [JigsawDemoDescriptionModule, JigsawSearchInputModule, JigsawHeaderModule, JigsawButtonModule, JigsawSwitchModule]
})
export class SearchInputOptionsDemoModule {}
