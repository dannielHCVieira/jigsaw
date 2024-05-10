import { Component } from "@angular/core";

@Component({
    templateUrl: './demo.component.html',
    styleUrls: ['./../../assets/demo.common.css']
})
export class NumericInputNegativeValueDemoComponent {
    public value: number;
    public min = -100;
    public max = -10;
    
    public valueChange($event) {
        console.log($event, typeof $event == "number");
    }

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = '';
    description: string = '';
}
