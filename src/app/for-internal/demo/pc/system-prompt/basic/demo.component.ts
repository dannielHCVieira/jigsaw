import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { JigsawSystemPrompt } from "jigsaw/public_api";

@Component({
    templateUrl: "./demo.component.html",
    styleUrls: ['./../../assets/demo.common.css', './demo.component.css']
})
export class JigsawSystemPromptBasicDemoComponent {
    public instances: JigsawSystemPrompt[] = [];

    @ViewChild('container1', { read: ViewContainerRef })
    public container1: ViewContainerRef;
    @ViewChild('container2', { read: ViewContainerRef })
    public container2: ViewContainerRef;
    @ViewChild('container3', { read: ViewContainerRef })
    public container3: ViewContainerRef;

    public timeout = 8000;

    private _save(instance) {
        this.instances.push(instance);
        instance.dispose.subscribe(()=>{
            const index = this.instances.indexOf(instance);
            if (index !== -1) {
                this.instances.splice(index, 1);
            }
        })
    }

    public showSystemPrompt1(message, type) {
        const instance = JigsawSystemPrompt.show(message, this.container1, { type: type, timeout: this.timeout });
        this._save(instance);
    }
    public showSystemPrompt2(message, type) {
        const instance = JigsawSystemPrompt.show(message, this.container2, { type: type, timeout: this.timeout });
        this._save(instance);
    }
    public showSystemPrompt3(message, type) {
        const instance = JigsawSystemPrompt.show(message, this.container3, { type: type, timeout: this.timeout });
        this._save(instance);
    }

    public showSuccess(message) {
        const instance = JigsawSystemPrompt.showSuccess(message, this.container3, this.timeout);
        this._save(instance);
    }
    public showError(message) {
        const instance = JigsawSystemPrompt.showError(message, this.container3, this.timeout);
        this._save(instance);
    }
    public showWarning(message) {
        const instance = JigsawSystemPrompt.showWarning(message, this.container3, this.timeout);
        this._save(instance);
    }
    public showInfo(message) {
        const instance = JigsawSystemPrompt.showInfo(message, this.container3, this.timeout);
        this._save(instance);
    }

    public showInstance() {
        console.log(this.instances);
    }

    // ====================================================================
    // ignore the following lines, they are not important to this demo
    // ====================================================================
    summary: string = "";
    description: string = "";
}
