import { Component } from "@angular/core";

@Component({
    templateUrl: "./demo.component.html",
    styleUrls: ['./../../assets/demo.common.css']
})
export class SearchInputOptionsDemoComponent {
    public _$value1: string;
    public _$value2: string;
    public _$value3: string;

    public filterOnFocus = true;

    public clear() {
        this._$value1 = '';
        this._$value2 = '';
        this._$value3 = '';
    }

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = "";
    description: string = "";
}
