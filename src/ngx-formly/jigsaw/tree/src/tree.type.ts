import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {FormlyFieldType} from "../../form-field";
import {JigsawTreeExt} from "@rdkmaster/jigsaw";

@Component({
    selector: 'formly-field-jigsaw-tree-ext',
    template: `
        <jigsaw-tree-ext
            [setting]="to.setting"
            [size]="to.size"
            [iconSuit]="to.iconSuit"
            [data]="to.data"
            (beforeAsync)="to.beforeAsync && to.beforeAsync($event)"
            (beforeCheck)="to.beforeCheck && to.beforeCheck($event)"
            (beforeClick)="to.beforeClick && to.beforeClick($event)"
            (beforeCollapse)="to.beforeCollapse && to.beforeCollapse($event)"
            (beforeDblClick)="to.beforeDblClick && to.beforeDblClick($event)"
            (beforeDrag)="to.beforeDrag && to.beforeDrag($event)"
            (beforeDragOpen)="to.beforeDragOpen && to.beforeDragOpen($event)"
            (beforeDrop)="to.beforeDrop && to.beforeDrop($event)"
            (beforeEditName)="to.beforeEditName && to.beforeEditName($event)"
            (beforeExpand)="to.beforeExpand && to.beforeExpand($event)"
            (beforeMouseDown)="to.beforeMouseDown && to.beforeMouseDown($event)"
            (beforeMouseUp)="to.beforeMouseUp && to.beforeMouseUp($event)"
            (beforeRemove)="to.beforeRemove && to.beforeRemove($event)"
            (beforeRename)="to.beforeRename && to.beforeRename($event)"
            (beforeRightClick)="to.beforeRightClick && to.beforeRightClick($event)"
            (onAsyncError)="to.onAsyncError && to.onAsyncError($event)"
            (onAsyncSuccess)="to.onAsyncSuccess && to.onAsyncSuccess($event)"
            (onCheck)="to.onCheck && to.onCheck($event)"
            (onClick)="to.onClick && to.onClick($event)"
            (onCollapse)="to.onCollapse && to.onCollapse($event)"
            (onDblClick)="to.onDblClick && to.onDblClick($event)"
            (onDrag)="to.onDrag && to.onDrag($event)"
            (onDragMove)="to.onDragMove && to.onDragMove($event)"
            (onDrop)="to.onDrop && to.onDrop($event)"
            (onExpand)="to.onExpand && to.onExpand($event)"
            (onMouseDown)="to.onMouseDown && to.onMouseDown($event)"
            (onMouseUp)="to.onMouseUp && to.onMouseUp($event)"
            (onNodeCreated)="to.onNodeCreated && to.onNodeCreated($event)"
            (onRemove)="to.onRemove && to.onRemove($event)"
            (onRename)="to.onRename && to.onRename($event)"
            (onRightClick)="to.onRightClick && to.onRightClick($event)"
        ></jigsaw-tree-ext>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormlyFieldTreeExt extends FormlyFieldType<JigsawTreeExt> {

    public setting = {
        edit: {
            enable: true,
            showRemoveBtn: false,
            showRenameBtn: false
        },
        data: {
            key: {
                children: 'nodes',
                name: 'label'
            }
        },
        check: {
            enable: true
        },
        view: {
            fontCss: undefined,
            showLine: true
        }
    }

    public iconSuit= {
        edit: "e166",
        remove: "e179",
        open: "e4e4",
        close: "e4e3",
        document: "e9d5",
        checkboxChecked: "e140",
        checkboxNotCheck: "e141",
        checkboxHalf: "e47a",
        nodeOpen: "ea09",
        nodeClose: "ea1c"
    }
    constructor() {
        super();
        this.defaultOptions = {
            templateOptions: {
                setting: this.setting,
                size: 'default',
                iconSuit: this.iconSuit,
            },
        };
    }
    @ViewChild(JigsawTreeExt)
    protected _instance: JigsawTreeExt;
}
