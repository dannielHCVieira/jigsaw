import {AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, OnInit, Renderer2} from "@angular/core";
import {AbstractJigsawViewBase} from "../../common";

export type BaseStyle = {
    left?: string | number,
    right?: string | number,
    top?: string | number,
    bottom?: string | number,
    width?: string,
    height?: string,
}
export type BasePosition = {
    host: BaseStyle,
}

export type AccessoryPosition = 'leftTop' | 'rightTop' | 'leftBottom' |
    'rightBottom' | 'top' | 'bottom' | 'center' | 'left' | 'right';

@Directive()
export abstract class AccessoryBase extends AbstractJigsawViewBase implements OnInit, AfterViewInit, OnDestroy {
    protected abstract calPosition(): BasePosition
    protected abstract addAccessory(): void;

    protected _accessory: HTMLElement;
    protected _removeClickHandler: Function;

    protected constructor(protected _render: Renderer2, protected _elementRef: ElementRef, zone?: NgZone) {
        super(zone);
    }

    // 给子类备用
    ngOnInit() {
        super.ngOnInit();
    }

    // 给子类备用
    ngAfterViewInit() {
        this.addAccessory();
    }

    // 给子类备用
    ngOnDestroy() {
        super.ngOnDestroy();
        if (this._removeClickHandler) {
            this._removeClickHandler();
        }
    }

    protected _updatePosition(position: BasePosition): void {
        this._setHostStyle();
        this._render.setStyle(this._accessory, 'left', position.host.left);
        this._render.setStyle(this._accessory, 'right', position.host.right);
        this._render.setStyle(this._accessory, 'top', position.host.top);
        this._render.setStyle(this._accessory, 'bottom', position.host.bottom);
        this._render.setStyle(this._accessory, 'width', position.host.width);
        this._render.setStyle(this._accessory, 'height', position.host.height);
    }

    // 设置宿主的样式，徽标本身采用absolute布局，所以需要考虑宿主的position和overflow
    private _setHostStyle(): void {
        const hostStyle = getComputedStyle(this._elementRef.nativeElement);
        if (["absolute", "relative", "fixed", "sticky"].findIndex(item => item == hostStyle.position) == -1) {
            this._elementRef.nativeElement.style.position = "relative";
        }
        if (hostStyle.overflow == 'hidden' || hostStyle.overflow == 'scroll') {
            this._elementRef.nativeElement.style.overflow = "visible";
        }
    }
}
