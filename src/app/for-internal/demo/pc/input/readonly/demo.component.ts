import { Component } from "@angular/core";

@Component({
    templateUrl: './demo.component.html',
    styleUrls: ['./../../assets/demo.common.css']
})
export class InputReadonlyDemoComponent {
    public inputValue: string;
    public inputValue2: string = '只读输入框';
    public inputValue3: string = '只读输入框带图标';
s
    public backIcon: string = 'iconfont iconfont-e9ee';

    public readonly: boolean = true;

    public onIconSelect(icon) {
        console.log('icon selected:', icon);
    }
    
    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = '';
    description: string = '';
}
