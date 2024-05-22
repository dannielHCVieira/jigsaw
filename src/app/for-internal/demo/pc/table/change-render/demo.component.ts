import {Component, TemplateRef, ViewChild} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {TableData, ColumnDefine} from "jigsaw/public_api";

@Component({
    templateUrl: './demo.component.html'
})
export class TableChangeRenderDemoComponent {

    @ViewChild("render1") render1: TemplateRef<any>;
    @ViewChild("render2") render2: TemplateRef<any>;

    tableData: TableData;

    constructor(http: HttpClient) {
        this.tableData = new TableData();
        this.tableData.http = http;
        this.tableData.fromObject({
            "field": [
                "name",
                "gender",
                "position",
                "salary",
                "enroll-date",
                "office",
                "desc"
            ],
            "header": [
                "姓名",
                "性别",
                "职位",
                "薪资",
                "入职日期",
                "部门",
                "描述"
            ],
            "data": [
                [
                    "Michelle",
                    "女",
                    "Developer",
                    19850,
                    "2015/2/18",
                    "Platform II",
                    "蜜雪儿，紫菀花。"
                ],
                [
                    "Mignon_Michelle",
                    "女",
                    "System Architect",
                    13208,
                    "2016/4/16",
                    "Platform III",
                    "蜜妮安，细致而优雅。"
                ]]
        });
    }

    columns: ColumnDefine[];

    ngOnInit() {
        this.columns = [
            {
                target: ['name'],
                header: {
                    // 通过ViewChild获取的TemplateRef,在AfterViewInit之后才能拿到,这边必须采用异步获取。
                    renderer: () => this.render1
                },
                cell: {
                    // 通过ViewChild获取的TemplateRef,在AfterViewInit之后才能拿到,这边必须采用异步获取。
                    renderer: () => this.render2
                }
            }
        ];
        setTimeout(() => {
            // 等待this.columns赋值给表格
            this.tableData.refresh();
        })
    }

    changeRenderer() {
        this.columns = [
            {
                target: ['name'],
                header: {
                    // 通过ViewChild获取的TemplateRef,在AfterViewInit之后才能拿到,这边必须采用异步获取。
                    renderer: () => this.render2
                },
                cell: {
                    // 通过ViewChild获取的TemplateRef,在AfterViewInit之后才能拿到,这边必须采用异步获取。
                    renderer: () => this.render1
                }
            }
        ];
        setTimeout(() => {
            // 等待this.columns赋值给表格
            this.tableData.refresh();
        })
    }

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = '';
    description: string = '';
}
