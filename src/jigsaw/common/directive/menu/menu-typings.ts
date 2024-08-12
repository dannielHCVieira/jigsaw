import {PopupInfo} from "../../service/popup.service";

export type MenuTheme = 'light' | 'dark' | 'navigation';

/**
 * @internal
 */
export const cascadingMenuFlag = class CascadingMenuFlag {
};

/**
 * @internal
 */
export function closeAllContextMenu(popups: PopupInfo[]): void {
    popups.filter(popup => popup.extra === cascadingMenuFlag)
        .forEach(popup => popup.dispose());
}
