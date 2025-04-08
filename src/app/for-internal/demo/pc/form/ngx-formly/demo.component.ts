import {Component, ElementRef, ViewChild} from "@angular/core";
import {FormGroup, UntypedFormGroup} from '@angular/forms';
import {FormlyFieldConfig} from "@ngx-formly/core";
import {
    ArrayCollection, TimeGr, TimeService, TableData,
    ColumnDefine
} from "jigsaw/public_api";

@Component({
    templateUrl: 'demo.component.html',
    styleUrls: ['demo.component.css']
})
export class NgxFormlyDemoComponent {
    @ViewChild('elementForm', {read: ElementRef})
    elementForm: ElementRef;

    public ngForm: UntypedFormGroup = new UntypedFormGroup({});
    public fields: FormlyFieldConfig[];
    public model = {
        input: "Jigsaw Formly",
        single: "抖音直播",
        multiple: ["抖音直播", "支付宝支付"],
        multipleGroup: [{ groupName: "城市1", data: [{ label: "南京" }] }]
    };

    ngOnInit() {
        this.fields = [
            {
                "type": "input",
                "key": "input",
                "templateOptions": {
                    "label": "输入框",
                    "required": true
                },
                "wrappers": ["form-field"]
            },
            {
                "type": "select",
                "key": "single",
                "templateOptions": {
                    "label": "单选下拉",
                    "data": [
                        "抖音直播",
                        "支付宝支付",
                        "学习强国",
                        "微信支付",
                        "淘宝购物"
                    ],
                    "required": true,
                    "clearable": true
                },
                "wrappers": ["form-field"]
            },
            {
                "type": "select",
                "key": "multiple",
                "templateOptions": {
                    "label": "多选下拉",
                    "data": [
                        "抖音直播",
                        "支付宝支付",
                        "学习强国",
                        "微信支付",
                        "淘宝购物"
                    ],
                    "optionCount": 10,
                    "multipleSelect": true,
                    "searchable": true,
                    "useStatistics": false,
                    "required": true,
                    "clearable": true
                },
                "wrappers": ["form-field"]
            },,
            {
                "type": "select-group",
                "key": "multipleGroup",
                "templateOptions": {
                    "label": "多选分组下拉",
                    "data": [
                        { groupName: "城市1", data: [{ label: "北京" }, { label: "上海" }, { label: "南京" }] },
                        { groupName: "城市2", data: [{ label: "深圳" }, { label: "长沙" }, { label: "西安" }] }
                    ],
                    "multipleSelect": true,
                    "searchable": true,
                    "useStatistics": false,
                    "required": true,
                    "clearable": true
                },
                "wrappers": ["form-field"]
            },
            {
                "fieldGroupClassName": "awade-form-group",
                "fieldGroup": [
                    {
                        "type": "button",
                        "key": "button",
                        "templateOptions": {
                            "hideLabel": true,
                            "width": "100px",
                            "content": "表单数据",
                            "click": this.onClick.bind(this)
                        },
                        "className": "awade-form-group-button",
                        "wrappers": ["form-field"]
                    }
                ]
            }
        ]
    }

    public onClick() {
        console.log(">>>>>>>>> ", this.model);
    }

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = '';
    description: string = '';
}
