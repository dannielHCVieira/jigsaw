import {Component} from "@angular/core";

@Component({
    templateUrl: './demo.component.html',
    styleUrls: ['./../../assets/demo.common.css']
})
export class NumericInputPrecisionDemoComponent {
    public value: number;

    public precisionDefault: false;
    public stepDefault: false;

    public _$precision = 2;

    public _$step = 0.1;

    public get precision() {
        return this.precisionDefault ? undefined : this._$precision;
    }

    public get step() {
        return this.stepDefault ? 1 : this._$step;
    }

    public valueChange($event) {
        console.log("valueChange=>", $event);
    }

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = '';
    description: string = '';
}
