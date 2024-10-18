import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {DialogButtonsDemoModule} from "./buttons/demo.module";
import {DialogButtonsDemo} from "./buttons/demo.component";

export const routerConfig:any = [
    {
        path: 'buttons', component: DialogButtonsDemo
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routerConfig),
        DialogButtonsDemoModule,
    ]
})
export class DialogMobileDemoModule {
}
