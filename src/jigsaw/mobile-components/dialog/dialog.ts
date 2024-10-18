import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Injector,
    Input,
    NgModule,
    NgZone,
    Output,
    QueryList,
    Renderer2
} from "@angular/core";
import {ButtonInfo, IPopupable} from "../../common/service/popup.service";
import {CommonModule} from "@angular/common";
import {JigsawMobileButton, JigsawMobileButtonModule} from "../button/button";
import {JigsawBlockModule} from "../../common/components/block/block";
import {JigsawMovableModule} from "../../common/directive/movable/index";
import {AbstractDialogComponentBase} from "../../common/components/base/dialog/dialog";

@Component({
    selector: 'jigsaw-mobile-dialog, j-mobile-dialog',
    templateUrl: 'dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JigsawMobileDialog extends AbstractDialogComponentBase implements AfterContentInit {
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
    @ContentChildren(JigsawMobileButton, {descendants: true})
    public _$inlineButtons: QueryList<JigsawMobileButton>;
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
            // 只有通过 "[jigsaw-mobile-button], [jigsaw-mobile-button-bar]" 投影进来的button，才算 button-group 里面的
            return btn.element.nativeElement.hasAttribute('jigsaw-mobile-button') ||
                (btn.element.nativeElement.parentElement && btn.element.nativeElement.parentElement.hasAttribute('jigsaw-mobile-button-bar'));
        });
    }
}

@NgModule({
    imports: [CommonModule, JigsawMobileButtonModule, JigsawMovableModule, JigsawBlockModule],
    declarations: [JigsawMobileDialog],
    exports: [JigsawMobileDialog]
})
export class JigsawMobileDialogModule {
}
