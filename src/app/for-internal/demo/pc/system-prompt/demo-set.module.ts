import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { JigsawSystemPromptBasicDemoModule } from "./basic/demo.module";
import { JigsawSystemPromptBasicDemoComponent } from "./basic/demo.component";
import { JigsawSystemPromptTrustedHtmlDemoModule } from "./trusted-html/demo.module";
import { JigsawSystemPromptTrustedHtmlDemoComponent } from "./trusted-html/demo.component";

export const routerConfig = [
    { path: "basic", component: JigsawSystemPromptBasicDemoComponent },
    { path: "trusted-html", component: JigsawSystemPromptTrustedHtmlDemoComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routerConfig), JigsawSystemPromptBasicDemoModule, JigsawSystemPromptTrustedHtmlDemoModule]
})
export class SystemPromptDemoModule {}
