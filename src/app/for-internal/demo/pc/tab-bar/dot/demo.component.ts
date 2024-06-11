import {Component} from '@angular/core';
import {ArrayCollection} from "jigsaw/public_api";

@Component({
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.css']
})
export class DotBarDemoComponent {
    tabs = new ArrayCollection([
        {label: "Tab 1", idx: 0},
        {label: "Tab 2", idx: 1},
        {label: "Tab 3", idx: 2},
        {label: "Tab 4", idx: 3}
    ]);
    selectedIndex = 0;
    colors = [
        {label: "品牌", value: 'var(--brand-default)'},
        {label: "成功", value: 'var(--success-default)'},
        {label: "警告", value: 'var(--warning-default)'},
        {label: "错误", value: 'var(--error-default)'},
        {label: "自定义", value: '#4B97FA'}
    ];
    docColor: string = 'var(--brand-default)';

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================

    summary: string = '此demo展示jigsaw-dot-bar圆点导航条和tabs结合实现的切换效果';
    description: string = '';
}
