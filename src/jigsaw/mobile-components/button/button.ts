import {ChangeDetectionStrategy, Component, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AbstractJigsawButtonBase} from "../../common/components/base/button";

/**
 * 在界面上显示一个按钮，最常见最简单的组件。
 * - 支持多种预设颜色用于表达按钮不同的作用，参考`colorType`；
 * - 支持多种预设尺寸以适应不同场合，参考`preSize`；
 * - 支持任意自定义尺寸，[参考这里](/#/components/button?demo=button-login)；
 * - 支持彻底的自定义标签，甚至与loading融合在一起使用，[参考这里](/#/components/button?demo=button-loading)；
 *
 * 这是一个表单友好组件。与表单配合使用时，建议用法
 * `<button jigsaw-mobile-button type="submit"></button>`，
 */
@Component({
    selector: 'jigsaw-mobile-button, a[jigsaw-mobile-button], button[jigsaw-mobile-button], jm-button, a[jm-button], button[jm-button]',
    templateUrl: 'button.html',
    host: {
        '[style.min-width]': 'width',
        '[style.height]': 'height',
        '[attr.data-theme]': 'theme',
        '[class.jigsaw-mobile-button-host]': 'true',
        '[class.jigsaw-mobile-button-disabled]': 'disabled',
        '[class.jigsaw-mobile-button-clicked]': "_$clicked",
        '[class.jigsaw-mobile-button-size-small]': "preSize === 'small'",
        '[class.jigsaw-mobile-button-size-medium]': "preSize === 'medium'",
        '[class.jigsaw-mobile-button-size-large]': "preSize === 'large'",
        '[class.jigsaw-mobile-button-color-primary]': "colorType === 'primary'",
        '[class.jigsaw-mobile-button-color-warning]': "colorType === 'warning'",
        '[class.jigsaw-mobile-button-color-error]': "colorType === 'error' || colorType === 'danger'",
        '[class.jigsaw-mobile-button-color-none]': "colorType === 'none'",
        '[class.jigsaw-mobile-button-icon-left]': "iconPosition === 'left'",
        '[class.jigsaw-mobile-button-icon-right]': "iconPosition === 'right'",
        '(click)': '_onClick()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JigsawMobileButton extends AbstractJigsawButtonBase {
}

@NgModule({
    imports: [CommonModule],
    declarations: [JigsawMobileButton],
    exports: [JigsawMobileButton]
})
export class JigsawMobileButtonModule {
}
