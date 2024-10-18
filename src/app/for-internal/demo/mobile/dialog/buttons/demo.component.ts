import {Component, TemplateRef, ViewEncapsulation} from '@angular/core';
import {PopupInfo, PopupService} from "jigsaw/mobile_public_api";

@Component({
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class DialogButtonsDemo {
    constructor(private popupService: PopupService) {
    }

    dialogInfo: PopupInfo;

    message: String;

    showInfo(label: string) {
        if (label) {
            this.message = `${label} button clicked!`;
        } else {
            this.message = `dialog close bar clicked!`;
        }
        this.dialogInfo.dispose();
    }

    popupDialog1(ele: TemplateRef<any>) {
        this.dialogInfo = this.popupService.popup(ele);
    }

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = '展示了移动端对话框的使用场景。';
    description: string = '';
}
