import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {TemplateDrivenDemoModule} from "./template-driven/demo.module";
import {NgxFormlyDemoModule} from "./ngx-formly/demo.module";

import {TemplateDrivenDemoComponent} from "./template-driven/demo.component";
import {NgxFormlyDemoComponent} from "./ngx-formly/demo.component";

export const routerConfig = [
    {
        path: 'template-driven', component: TemplateDrivenDemoComponent
    },
    {
        path: 'ngx-formly', component: NgxFormlyDemoComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routerConfig),
        TemplateDrivenDemoModule,
        NgxFormlyDemoModule
    ]
})
export class FormDemoModule {
}
