import { Component, ViewChild } from "@angular/core";
import { JigsawSearchInput } from "jigsaw/public_api";

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

    @ViewChild('search1')
    public search1: JigsawSearchInput;

    @ViewChild('search2')
    public search2: JigsawSearchInput;

    public open() {
        this.search1.openHistoryDropdown();
        this.search2.openHistoryDropdown();
    }

    public close() {
        this.search1.closeHistoryDropdown();
        this.search2.closeHistoryDropdown();
    }

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = "";
    description: string = "";
}
