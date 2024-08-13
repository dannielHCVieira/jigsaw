import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { IUploader, JigsawUploadDirective, UploadFileInfo } from "jigsaw/public_api";

@Component({
    templateUrl: './demo.component.html',
    styleUrls: ['./../../assets/demo.common.css', './demo.component.css'],
})
export class UploadPasteDemoComponent implements AfterViewInit{
    @ViewChild("first", { read: JigsawUploadDirective })
    public uploader: IUploader;

    public fileType = '.png, .jpg, .jpeg, .gif, .bmp, .svg, .webp';
    public multiple = true;

    public onChange(msg: string, data: UploadFileInfo | UploadFileInfo[]) {
        console.log(msg, "!!!!!!", data);
    }

    public pasteTargets = [];

    ngAfterViewInit() {
        const textarea = document.querySelector('.jigsaw-textarea-host textarea');
        this.pasteTargets.push(textarea);
        const div = document.querySelector('.paste-area');
        this.pasteTargets.push(div);
    }

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = '本demo展示了`jigsaw-upload`指令的基本用法';
    description: string = '';
}
