import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    Injector,
    Input,
    NgModule,
    NgZone,
    OnInit,
    Output,
    QueryList,
    Renderer2
} from "@angular/core";
import {ButtonInfo, IPopupable} from "../../common/service/popup.service";
import {WingsTheme} from "../../common/common";
import {CommonModule} from "@angular/common";
import {JigsawButton, JigsawButtonModule} from "../button/button";
import {JigsawBlockModule} from "../../common/components/block/block";
import {JigsawMovableModule} from "../../common/directive/movable/index";
import {AbstractDialogComponentBase} from "../../common/components/base/dialog/dialog";

export interface IDialog<T = ButtonInfo> extends IPopupable {
    buttons: ButtonInfo[];
    caption: string;
    dialog: JigsawDialog;
    dispose: (answer?: T) => void;
}

export type DialogCallback = (button: ButtonInfo) => void;

export type NoticeLevel = 'success' | 'error' | 'warning' | 'info' | 'custom';

/**
 * 这个类用于应用在需要根据已有的对话框组件派生出该对话框组件的更具体的对话框的时候使用。
 * 对话框组件是具备一定抽象性的，因此他们的API一般会较多较复杂，应用在使用时需要做较多的配置。
 * 已知的对话框组件有 JigsawDialog、JigsawAlert、JigsawNotification
 * 其中，Jigsaw已经基于JigsawAlert这类对话框派生出了4个内置的具体Alert组件，分别是
 * JigsawInfoAlert、JigsawWarningAlert、JigsawErrorAlert、JigsawConfirmAlert
 * 可以看到JigsawAlert使用起来比较麻烦，但是它具体化后的这些组件使用起来就非常简单了。
 */
@Directive()
export abstract class DialogBase<T = ButtonInfo> implements IDialog<T>, AfterViewInit, OnInit {

    /**
     * @NoMarkForCheckRequired
     */
    @Input()
    public initData: any;

    abstract get dialog(): JigsawDialog;
    abstract set dialog(value: JigsawDialog);

    private _caption: string = '';

    /**
     * @NoMarkForCheckRequired
     */
    @Input()
    public get caption(): string {
        return this._caption;
    }

    public set caption(value: string) {
        this._caption = value;
        if (this.dialog) {
            this.dialog.caption = value;
        }
    }

    private _icon: string = '';

    /**
     * @NoMarkForCheckRequired
     */
    @Input()
    public get icon(): string {
        return this._icon;
    }

    public set icon(value: string) {
        this._icon = value;
        if (this.dialog) {
            this.dialog.icon = value;
        }
    }

    private _buttons: ButtonInfo[];

    /**
     * @NoMarkForCheckRequired
     */
    @Input()
    public get buttons(): ButtonInfo[] {
        return this._buttons;
    }

    public set buttons(value: ButtonInfo[]) {
        this._buttons = value;
        if (this.dialog) {
            this.dialog.buttons = value;
        }
    }

    @Output()
    public answer: EventEmitter<T> = new EventEmitter<T>();

    public dispose: (answer?: T) => void;

    public ngOnInit() {
        if (this.dialog) {
            this.dialog.buttons = this.buttons;
            this.dialog.caption = this.caption;
        }
    }

    public ngAfterViewInit() {
        if (this.dialog) {
            this.dialog.answer.subscribe(answer => this.answer.emit(answer as T));
        }
    }
}

@WingsTheme('dialog.scss')
@Component({
    selector: 'jigsaw-dialog, j-dialog',
    templateUrl: 'dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JigsawDialog extends AbstractDialogComponentBase implements AfterContentInit {
    @Output()
    public close: EventEmitter<any> = new EventEmitter<any>();
    /**
     * @NoMarkForCheckRequired
     */
    @Input()
    public caption: string;

    /**
     * @NoMarkForCheckRequired
     */
    @Input()
    public icon: string;

    /**
     * @internal
     */
    @ContentChildren(JigsawButton, {descendants: true})
    public _$inlineButtons: QueryList<JigsawButton>;
    /**
     * @internal
     */
    public _$hasInlineButtons: boolean = false;

    constructor(protected renderer: Renderer2, protected elementRef: ElementRef, protected _zone: NgZone,
                // @RequireMarkForCheck 需要用到，勿删
                protected _injector: Injector) {
        super(renderer, elementRef, _zone, _injector);
        this.renderer.addClass(this.elementRef.nativeElement, 'jigsaw-dialog-host');
    }

    protected getPopupElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    ngAfterContentInit(): void {
        super.ngAfterContentInit();
        this._$hasInlineButtons = this._$inlineButtons.toArray().some(btn => {
            // 只有通过 "[jigsaw-button], [jigsaw-button-bar]" 投影进来的button，才算 button-group 里面的
            return btn.element.nativeElement.hasAttribute('jigsaw-button') ||
                (btn.element.nativeElement.parentElement && btn.element.nativeElement.parentElement.hasAttribute('jigsaw-button-bar'));
        });
    }
}

@NgModule({
    imports: [CommonModule, JigsawButtonModule, JigsawMovableModule, JigsawBlockModule],
    declarations: [JigsawDialog],
    exports: [JigsawDialog]
})
export class JigsawDialogModule {
}
