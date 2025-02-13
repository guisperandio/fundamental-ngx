import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    HostBinding,
    Input,
    OnChanges,
    ViewEncapsulation
} from '@angular/core';
import { applyCssClass } from '@fundamental-ngx/core/utils';
import { CssClassBuilder } from '@fundamental-ngx/core/utils';

/**
 * Directive used to identify the template which will populate the tab header.
 * Used to achieve complex headers that require more than a string.
 *
 * ```html
 * <fd-tab>
 *      <ng-template fd-tab-title>
 *          <fd-icon [glyph]="'delete'"></fd-icon>
 *          <span>Tab Label</span>
 *      </ng-template>
 * </fd-tab>
 * ```
 */
@Directive({
    // TODO to be discussed
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[fd-tab-title-template]'
})
export class TabTitleDirective {}

/**
 * Directive for counter element, available in most of modes on `tab` component
 */
@Directive({
    // TODO to be discussed
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[fd-tab-count]'
})
export class TabCountDirective {
    /** @hidden */
    @HostBinding('class.fd-tabs__count')
    fdTabsCountClass = true;
}

/**
 * Directive for icon element, available in most of modes on `tab` component
 */
@Component({
    // eslint-disable-next-line @angular-eslint/directive-selector, @angular-eslint/component-selector
    selector: '[fd-tab-icon]',
    template: `
        <fd-icon role="presentation" *ngIf="icon" [glyph]="icon"></fd-icon>
        <ng-content></ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TabIconComponent implements CssClassBuilder, OnChanges {
    /** Apply user custom styles */
    @Input()
    class: string;

    /**
     * The icon to include inside the element
     * See the icon page for the list of icons.
     */
    @Input()
    icon: string;

    /** @hidden */
    constructor(private _elementRef: ElementRef) {}

    /** @hidden
     * Function runs when component is initialized
     * function should build component css class
     * function should build css style
     */
    ngOnChanges(): void {
        this.buildComponentCssClass();
    }

    @applyCssClass
    /** CssClassBuilder interface implementation
     * function must return single string
     * function is responsible for order which css classes are applied
     */
    buildComponentCssClass(): string[] {
        return ['fd-tabs__icon', this.class];
    }

    /** HasElementRef interface implementation
     * function used by applyCssClass and applyCssStyle decorators
     */
    elementRef(): ElementRef<any> {
        return this._elementRef;
    }
}

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[fd-tab-tag]',
    host: {
        class: 'fd-tabs__tag'
    }
})
export class TabTagDirective {}

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[fd-tab-label]',
    host: {
        class: 'fd-tabs__label'
    }
})
export class TabLabelDirective {}

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[fd-tab-process]',
    host: {
        class: 'fd-tabs__process'
    }
})
export class TabProcessDirective {}

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[fd-tab-header]',
    host: {
        class: 'fd-tabs__header'
    }
})
export class TabHeaderDirective {}

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[fd-tab-counter-header]',
    host: {
        class: 'fd-tabs__counter-header'
    }
})
export class TabCounterHeaderDirective {}

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[fd-tab-process-icon]',
    host: {
        class: 'fd-tabs__process-icon'
    }
})
export class TabProcessIconDirective {}

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[fd-tab-separator]',
    host: {
        class: 'fd-tabs__separator'
    }
})
export class TabSeparatorDirective {}
