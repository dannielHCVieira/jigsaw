import {Component} from "@angular/core";

@Component({
    templateUrl: './demo.component.html',
    styleUrls: ['./../../assets/demo.common.css']
})
export class InputDisabledComponent {

    enabled: boolean;

    public backIcon: string = 'iconfont iconfont-e9ee';

    public onIconSelect(icon) {
        console.log('icon selected:', icon);
    }

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = '';
    description: string = '';
}
