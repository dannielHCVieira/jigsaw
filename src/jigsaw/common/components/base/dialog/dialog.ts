import {
    AfterContentInit,
    Directive,
    ElementRef,
    EventEmitter,
    Injector,
    Input,
    NgZone,
    OnDestroy,
    Output,
    Renderer2
} from "@angular/core";
import {ButtonInfo, IPopupable} from "../../../../common/service/popup.service";
import {AbstractJigsawComponent} from "../../../../common/common";
import {CommonUtils} from "../../../../common/core/utils/common-utils";
import {RequireMarkForCheck} from "../../../../common/decorator/mark-for-check";


/**
 * 这是所有对话框组件的基类，是一个内部，应用一般不应该直接使用这个类。
 * 当需要实现一种新的对话框的时候，则需要继承这个类，已知的对话框组件有JigsawDialog、JigsawAlert、JigsawNotification
 */
@Directive()
export abstract class AbstractDialogComponentBase
    extends AbstractJigsawComponent
    implements IPopupable, AfterContentInit, OnDestroy {

    protected constructor(protected renderer: Renderer2, protected elementRef: ElementRef, protected _zone: NgZone,
                          // @RequireMarkForCheck 需要用到，勿删
                          protected _injector: Injector) {
        super(_zone);
    }

    @RequireMarkForCheck()
    @Input()
    public buttons: ButtonInfo[];

    @RequireMarkForCheck()
    @Input()
    public caption: string;

    @RequireMarkForCheck()
    @Input()
    public icon: string;

    /**
     * @NoMarkForCheckRequired
     */
    @Input()
    public initData: any;

    protected popupElement: HTMLElement;

    private _top: string;

    /**
     * 设置距离顶部高度
     *
     * @NoMarkForCheckRequired
     */
    @Input()
    public get top(): string {
        return this._top
    }

    public set top(newValue: string) {
        this._top = CommonUtils.getCssValue(newValue);
    }

    @Output()
    public answer: EventEmitter<ButtonInfo> = new EventEmitter<ButtonInfo>();

    public close: EventEmitter<any>;

    public ngAfterContentInit() {
        this.init();
    }

    public dispose(answer?: ButtonInfo) {
        this.answer.emit(answer);
        if (!answer && this.close) {
            // 单击了叉叉按钮，额外发送close事件
            this.close.emit();
        }
    }

    protected abstract getPopupElement(): HTMLElement;

    protected init() {
        this.popupElement = this.getPopupElement();

        //设置弹框宽度
        if (this.width) {
            this.renderer.setStyle(this.popupElement, 'width', this.width);
        }

        if (this.height) {
            this.renderer.setStyle(this.popupElement, 'height', this.height);
            this.renderer.addClass(this.popupElement, 'jigsaw-dialog-fixed-height');
        }

        //设置弹出位置和尺寸
        this.runAfterMicrotasks(() => {
            if (this.top) {
                this.renderer.setStyle(this.popupElement, 'top', this.top);
            }
            if (this.popupElement.style.position != 'fixed' && this.popupElement.style.position != 'absolute') {
                this.renderer.setStyle(this.popupElement.querySelector('.jigsaw-dialog-base-head'), 'cursor', 'inherit');
            }
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.answer.unsubscribe();
    }
}
