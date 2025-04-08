import {NgModule} from '@angular/core';
import {FormlyJigsawFormFieldModule} from "../../form-field";
import {FormlyJigsawButtonBarModule} from "../../button-bar";
import {FormlyJigsawInputModule} from "../../input";
import {FormlyJigsawCheckboxModule} from "../../checkbox";
import {FormlyJigsawRadioModule} from "../../radio";
import {FormlyJigsawSwitchModule} from '../../switch';
import {FormlyJigsawTextAreaModule} from "../../textarea";
import {FormlyJigsawSelectModule} from "../../select";
import {FormlyJigsawListLiteModule} from "../../list-lite";
import {FormlyJigsawTileLiteModule} from "../../tile-lite";
import {FormlyJigsawSliderModule} from '../../slider';
import {FormlyJigsawCascadeModule} from "../../cascade";
import {FormlyJigsawDateTimeModule} from "../../time";
import {FormlyJigsawButtonModule} from "../../button";
import {FormlyJigsawIconModule} from "../../icon";
import {FormlyJigsawTableModule} from "../../table";
import {FormlyTemplateModule} from "../../template";
import {FormlyJigsawHeaderModule} from "../../header";
import {FormlyJigsawUploadModule} from "../../upload";
import {FormlyFieldRepeatModule} from '../../repeat';
import {FormlyJigsawTreeExtModule} from '../../tree';

@NgModule({
    imports: [
        FormlyJigsawFormFieldModule,
        FormlyJigsawButtonBarModule,
        FormlyJigsawInputModule,
        FormlyJigsawCheckboxModule,
        FormlyJigsawRadioModule,
        FormlyJigsawSwitchModule,
        FormlyJigsawTextAreaModule,
        FormlyJigsawSelectModule,
        FormlyJigsawListLiteModule,
        FormlyJigsawTileLiteModule,
        FormlyJigsawSliderModule,
        FormlyJigsawCascadeModule,
        FormlyJigsawDateTimeModule,
        FormlyJigsawButtonModule,
        FormlyJigsawIconModule,
        FormlyJigsawTableModule,
        FormlyTemplateModule,
        FormlyJigsawHeaderModule,
        FormlyJigsawUploadModule,
        FormlyFieldRepeatModule,
        FormlyJigsawTreeExtModule
    ]
})
export class FormlyJigsawModule {
}
