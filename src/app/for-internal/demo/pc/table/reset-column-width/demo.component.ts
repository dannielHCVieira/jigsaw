import { Component } from "@angular/core";
import { TableData, TableDataField, TableDataHeader, TableDataMatrix} from "jigsaw/public_api";

@Component({
    templateUrl: './demo.component.html',
    styleUrls: ['../column-resizable/demo.component.css']
})
export class TableResetColumnWidthDemoComponent {
    public tableData: TableData;

    private _data: TableDataMatrix = [
        [
            "Tiger Nixon1",
            "System Architect",
            "$320,00",
            "2011/04/25",
            "Edinburgh",
            "542"
        ],
        [
            "Garrett Winters1",
            "Accountant",
            "$170,7",
            "2011/07/25",
            "Tokyo",
            "8422"
        ],
        [
            "Tiger Nixon2",
            "System Architect",
            "$320,8000",
            "2011/04/25",
            "Edinburgh",
            "5421"
        ],
    ];
    private _fields: TableDataField = ["name", "position", "salary", "enroll-date"];
    private _header: TableDataHeader = ["姓名", "职位", "薪资", "入职日期"]
    constructor() {
        this.updateData();
    }

    public changeData() {
        this._data = [
            [
                "Tiger",
                "System",
                "$5555555,00",
                "2024/04/25",
                "Edinburgh",
                "5421"
            ],
            [
                "Garrett",
                "Accountant",
                "$170,7",
                "2024/07/25",
                "Tokyo",
                "8422"
            ],
            [
                "Tiger",
                "Architect",
                "$564,8000",
                "2024/04/25",
                "Edinburgh",
                "542"
            ],
        ];
        this._fields = ["name", "position", "salary", "enroll-date"];
        this._header = ["姓名", "职位", "薪资", "入职日期"];
        this.tableData.refresh();
        this.updateData();
    }

    public addFields() {
         this._fields.push("office", "extn");
         this._header.push("部门", "其他");
         this.tableData.refresh();
    }

    public reduceFields() {
        this._fields.splice(-1, 1);
        this._header.splice(-1, 1);
        this.tableData.refresh();
    }

    public changeFieldsOrder() {
        this._fields = this.shuffleArray(this._fields);
        this._header = this.shuffleArray(this._header);
        this.tableData.refresh();
    }

    private shuffleArray(array: string[]): string[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private updateData() {
        this.tableData = new TableData(
            this._data,
            this._fields,
            this._header);
    }


    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = '';
    description: string = '';
}
