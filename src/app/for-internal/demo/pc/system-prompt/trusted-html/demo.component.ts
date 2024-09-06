import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { JigsawSystemPrompt, NoticeLevel } from "jigsaw/public_api";

@Component({
    templateUrl: "./demo.component.html",
    styleUrls: ['./../../assets/demo.common.css', './demo.component.css']
})
export class JigsawSystemPromptTrustedHtmlDemoComponent {
    public instances: JigsawSystemPrompt[] = [];

    @ViewChild('container1', { read: ViewContainerRef })
    public container1: ViewContainerRef;

    public timeout = 8000;
    public message = `提示：支持基础html片段，因此可以使用<code>a</code> / <code>button</code> 等标签可以实现自定义交互。<a onclick="confirm()">确定</a>`;
    public enableHtml = true;
    public types = [
        { label: '成功', value: 'success' },
        { label: '错误', value: 'error' },
        { label: '警告', value: 'warning' },
        { label: '消息', value: 'info' },
        { label: '自定义', value: 'custom' },
    ];
    public type = [{ label: '自定义', value: 'custom' }];

    public confirm() {
        alert('实现自定义交互');
    }
    public show() {
        JigsawSystemPrompt.show(this.message, this.container1, { type: this.type[0].value as NoticeLevel, timeout: this.timeout, innerHtmlContext: this.enableHtml ? this : undefined });
    }

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = "";
    description: string = "";
}
