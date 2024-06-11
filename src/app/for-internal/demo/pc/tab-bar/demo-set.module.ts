import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {RouterModule} from "@angular/router";
import {JigsawTabBarComponent} from "./basic/demo.component";
import {JigsawTabBarDemoModule} from "./basic/demo.module";
import {TabBarTypeDemoComponent} from './type/demo.component';
import {TabBarTypeDemoModule} from './type/demo.module';
import {TabBarBackgroundDemoComponent} from './background/demo.component';
import {TabBarBackgroundDemoModule} from './background/demo.module';
import {TabBarEditableDemoComponent} from './editable/demo.component';
import {TabBarEditableDemoModule} from './editable/demo.module';
import {TabBarStyleOptionsDemoComponent} from './style-options/demo.component';
import {TabBarStyleOptionsDemoModule} from './style-options/demo.module';
import {DotBarDemoComponent} from "./dot/demo.component";
import {DotBarDemoModule} from "./dot/demo.module";

export const routerConfig = [
    {
        path: 'basic', component: JigsawTabBarComponent
    },
    {
        path: 'type', component: TabBarTypeDemoComponent
    },
    {
        path: 'background', component: TabBarBackgroundDemoComponent
    },
    {
        path: 'editable', component: TabBarEditableDemoComponent
    },
    {
        path: 'style-options', component: TabBarStyleOptionsDemoComponent
    },
    {
        path: 'dot-bar', component: DotBarDemoComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routerConfig), JigsawTabBarDemoModule, TabBarTypeDemoModule, TabBarBackgroundDemoModule, TabBarEditableDemoModule,
        TabBarStyleOptionsDemoModule, DotBarDemoModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TabBarDemoModule {
}
