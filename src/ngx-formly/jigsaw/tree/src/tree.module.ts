import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {FormlyModule} from '@ngx-formly/core';
import {JigsawTreeExtModule} from "@rdkmaster/jigsaw";
import {FormlyJigsawFormFieldModule} from "../../form-field";
import {FormlyFieldTreeExt} from "./tree.type";

@NgModule({
    declarations: [FormlyFieldTreeExt],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        JigsawTreeExtModule,
        FormlyJigsawFormFieldModule,
        FormlyModule.forChild({
            types: [
                {
                    name: 'tree',
                    component: FormlyFieldTreeExt,
                    wrappers: ['form-field'],
                }
            ]
        })
    ]
})
export class FormlyJigsawTreeExtModule {
}
