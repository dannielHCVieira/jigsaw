import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {JigsawButtonModule} from "jigsaw/public_api";
import {JigsawDemoDescriptionModule} from "app/for-internal/description/demo-description";
import {NgxFormlyDemoComponent} from "./demo.component";

import {FormlyModule} from '@ngx-formly/core';
import {FormlyJigsawModule} from "@rdkmaster/formly";

@NgModule({
    imports: [
        FormsModule, ReactiveFormsModule, CommonModule, FormlyJigsawModule, FormlyModule.forChild(), JigsawButtonModule, JigsawDemoDescriptionModule
    ],
    declarations: [NgxFormlyDemoComponent],
    exports: [NgxFormlyDemoComponent]
})
export class NgxFormlyDemoModule {

}
