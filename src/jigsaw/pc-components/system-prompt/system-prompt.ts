import {
    ChangeDetectionStrategy,
    Component,
    ComponentFactoryResolver,
    Injector,
    Input,
    NgModule,
    OnDestroy,
    ViewContainerRef,
    ComponentRef,
    Output,
    EventEmitter
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { CommonUtils } from "../../common/core/utils/common-utils";
import { NoticeLevel } from "../dialog/dialog";
import { RequireMarkForCheck } from '../../common/decorator/mark-for-check';
import { AbstractJigsawComponent} from "../../common/common";
import { JigsawTrustedHtmlModule } from "../../common/directive/trusted-html/trusted-html"

export class SystemPromptMessage {
    type?: NoticeLevel;
    timeout?: number;
    innerHtmlContext?: any;
}

@Component({
    selector: 'jigsaw-system-prompt, j-system-prompt',
    templateUrl: 'system-prompt.html',
    host: {
        '[class.jigsaw-system-prompt-host]': 'true',
        '[class.jigsaw-system-prompt-error]': 'type == "error"',
        '[class.jigsaw-system-prompt-info]': 'type == "info"',
        '[class.jigsaw-system-prompt-warning]': 'type == "warning"',
        '[class.jigsaw-system-prompt-success]': 'type == "success"',
        '[class.jigsaw-system-prompt-custom]': 'type == "custom"'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JigsawSystemPrompt extends AbstractJigsawComponent implements OnDestroy {
    constructor(
        // @RequireMarkForCheck 需要用到，勿删
        private _injector: Injector) {
        super();
    }

    private _componentRef: ComponentRef<JigsawSystemPrompt>;

    @Input()
    @RequireMarkForCheck()
    public message: string;

    @Input()
    @RequireMarkForCheck()
    public type: NoticeLevel = 'error';

    /**
     * 当`message`里包含html交互动作时，`JigsawSystemPrompt`在执行给定的回调函数时，会将这个对象作为函数的上下文。
     * 简单的说，这个属性值和回调函数里的`this`是同一个对象。
     *
     * @NoMarkForCheckRequired

     */
    @Input()
    public innerHtmlContext: any;

    /**
     * @NoMarkForCheckRequired
     */
    @Input()
    public timeout: number = 0;

    private _timer: number;

    @Output()
    public dispose: EventEmitter<any> = new EventEmitter<any>();

    public static show(message: string, containerRef: ViewContainerRef, options?: SystemPromptMessage): JigsawSystemPrompt {
        const factory = containerRef.injector.get(ComponentFactoryResolver).resolveComponentFactory(JigsawSystemPrompt);
        const componentRef = containerRef.createComponent(factory);
        const instance = componentRef.instance;
        instance.type = options?.type || 'error';
        instance.timeout = CommonUtils.isDefined(options?.timeout) ? options.timeout : 8000;
        instance.message = message;
        instance.innerHtmlContext = options?.innerHtmlContext;
        instance._componentRef = componentRef;
        instance._setupTimeout();
        containerRef.element.nativeElement.appendChild(componentRef.location.nativeElement);
        return instance;
    }

    public static showSuccess(message: string, containerRef: ViewContainerRef, timeout: number = 8000): JigsawSystemPrompt {
        const options: SystemPromptMessage = {type: "success", timeout};
        return this.show(message, containerRef, options);
    }

    public static showError(message: string, containerRef: ViewContainerRef, timeout: number = 8000): JigsawSystemPrompt {
        const options: SystemPromptMessage = {type: "error", timeout};
        return this.show(message, containerRef, options);
    }

    public static showWarning(message: string, containerRef: ViewContainerRef, timeout: number = 8000): JigsawSystemPrompt {
        const options: SystemPromptMessage = {type: "warning", timeout};
        return this.show(message, containerRef, options);
    }

    public static showInfo(message: string, containerRef: ViewContainerRef, timeout: number = 8000): JigsawSystemPrompt {
        const options: SystemPromptMessage = {type: "info", timeout};
        return this.show(message, containerRef, options);
    }

    private _setupTimeout() {
        if (isNaN(this.timeout) || this.timeout <= 0) {
            return;
        }
        clearTimeout(this._timer);
        this._timer = setTimeout(() => this.remove(), this.timeout) as any;
    }

    public remove() {
        clearTimeout(this._timer);
        if (!this._componentRef) {
            return;
        }
        this._componentRef.destroy();
    }

    /**
     * @internal
     */
    public _$getIconClass() {
        switch (this.type) {
            case 'error':
                return 'e1a5';
            case 'info':
                return 'e23e';
            case 'warning':
                return 'e437';
            case 'success':
                return 'e142';
            default:
                return 'e1a5';
        }
    }

    ngOnDestroy() {
        clearTimeout(this._timer);
        this.dispose.emit();
    }
}

@NgModule({
    imports: [CommonModule, JigsawTrustedHtmlModule],
    declarations: [JigsawSystemPrompt],
    exports: [JigsawSystemPrompt]
})
export class JigsawSystemPromptModule { }
