import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {FormlyFieldType} from "../../form-field";
import {JigsawRadiosLite} from "@rdkmaster/jigsaw";

@Component({
    selector: 'formly-field-jigsaw-radio',
    template: `
        <jigsaw-radios-lite
            [formlyAttributes]="field"
            [formControl]="formControl"
            [value]="to.value"
            [data]="to.data"
            [valid]="to.valid && !showError"
            [trackItemBy]="to.trackItemBy"
            [labelField]="to.labelField"
            [theme]="to.theme"
            (valueChange)="to.valueChange && to.valueChange($event)"
        ></jigsaw-radios-lite>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[style.display]': "'flex'",
    },
})
export class FormlyFieldRadio extends FormlyFieldType<JigsawRadiosLite> {
    constructor() {
        super();
        this.defaultOptions = {
            templateOptions: {
                valid: true,
                data: [],
                labelField: 'label'
            }
        };
    }

    @ViewChild(JigsawRadiosLite)
    protected _instance: JigsawRadiosLite;
}
