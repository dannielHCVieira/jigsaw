import {Component} from "@angular/core";

@Component({
    templateUrl: './demo.component.html'
})
export class TextareaMaxLengthDemoComponent {
    /* Started by AICoder, pid:c4e79sabb1k3d331499b0a50901bc40b2f330af9 */
    public _$includesCRLF: boolean = true;
    public _$showLengthStats: boolean = true;
    public _$value = '多行文本框';
    /* Ended by AICoder, pid:c4e79sabb1k3d331499b0a50901bc40b2f330af9 */

    public _$valueChange($event: string): void {
        console.log(' input value: ', $event)
    }

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = '演示了多行文本框的 maxLength 的用法，包括统计时是否包含回车换行符';
    description: string = '';
}
