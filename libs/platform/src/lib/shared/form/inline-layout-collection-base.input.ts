import {
    ChangeDetectorRef,
    Directive,
    Host,
    Inject,
    Injectable,
    InjectionToken,
    Input,
    OnInit,
    Optional,
    Self,
    SkipSelf
} from '@angular/core';
import { NgControl, NgForm } from '@angular/forms';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { BehaviorSubject, Subject } from 'rxjs';

import { CollectionBaseInput } from './collection-base.input';
import { FormFieldControl } from './form-control';
import { FormField } from './form-field';

export interface InlineLayout {
    XL?: boolean;
    L?: boolean;
    M?: boolean;
    S?: boolean;
}

export enum RESPONSIVE_BREAKPOINTS {
    S = 600,
    M = 1024,
    L = 1440
}

export const RESPONSIVE_BREAKPOINTS_CONFIG = new InjectionToken<ResponsiveBreakPointConfig>(
    'Default Responsive breakpoint config'
);

@Injectable()
export class ResponsiveBreakPointConfig {
    L: number = RESPONSIVE_BREAKPOINTS['L'];
    M: number = RESPONSIVE_BREAKPOINTS['M'];
    S: number = RESPONSIVE_BREAKPOINTS['S'];
}

@Injectable({
    providedIn: 'root'
})
export class ResponsiveBreakpointsService {
    breakpoints: Record<string, any> = {};
    activeBreakpoints: string[];
    minWidth = 'min-width';
    maxWidth = 'max-width';
    unit = 'px';

    /** @hidden */
    constructor(readonly _breakpointObserver: BreakpointObserver) {}

    /** subscribe to get current screen size based on config provided */
    observeBreakpointByConfig(config: ResponsiveBreakPointConfig): Subject<any> {
        const breakPointName: Subject<string> = new BehaviorSubject('S');

        this._breakpointObserver.observe(this._getBreakpoints(config)).subscribe((matchValues) => {
            const breakPoint = this._breakPointMeet(matchValues);
            breakPointName.next(breakPoint);
        });

        return breakPointName;
    }

    /** @hidden when screen size changes from one breakpoint to another */
    private _breakPointMeet(breakPointMatchess: BreakpointState): string {
        let breakPointName: string;

        if (breakPointMatchess.matches) {
            for (const breakpoint in breakPointMatchess.breakpoints) {
                if (breakPointMatchess.breakpoints[breakpoint]) {
                    breakPointName = this._getBreakpointName(breakpoint);
                }
            }
        }

        return breakPointName;
    }

    /** @hidden */
    private _getBreakpoints(config: ResponsiveBreakPointConfig): string[] {
        let breakPointStr: string;
        this.activeBreakpoints = [];

        for (const screenSize of Object.keys(config)) {
            switch (screenSize) {
                case 'S':
                    breakPointStr = `(${this.maxWidth}: ${config[screenSize]}${this.unit})`;
                    this.activeBreakpoints.push(breakPointStr);
                    this.breakpoints[breakPointStr] = screenSize;
                    break;
                case 'M':
                    breakPointStr = `(${this.minWidth}: ${config['S']}${this.unit}) and (${this.maxWidth}: ${config[screenSize]}${this.unit})`;
                    this.activeBreakpoints.push(breakPointStr);
                    this.breakpoints[breakPointStr] = screenSize;
                    break;
                case 'L':
                    breakPointStr = `(${this.minWidth}: ${config['M']}${this.unit}) and (${this.maxWidth}: ${config[screenSize]}${this.unit})`;
                    this.activeBreakpoints.push(breakPointStr);
                    this.breakpoints[breakPointStr] = screenSize;

                    // create entry for XL screen
                    breakPointStr = `(${this.minWidth}: ${config[screenSize]}${this.unit})`;
                    this.activeBreakpoints.push(breakPointStr);
                    this.breakpoints[breakPointStr] = 'XL';
                    break;
            }
        }

        return this.activeBreakpoints;
    }

    /** @hidden */
    private _getBreakpointName(breakpointValue): string {
        return this.breakpoints[breakpointValue];
    }
}

@Directive()
export abstract class InLineLayoutCollectionBaseInput extends CollectionBaseInput implements OnInit {
    /** object to change isInline property based on screen size */
    @Input()
    get inlineLayout(): InlineLayout {
        return this._inlineLayout;
    }

    set inlineLayout(layout: InlineLayout) {
        this._inlineLayout = layout;
        this._isInLineLayoutEnabled = true;
        this._setFieldLayout(layout);
    }

    /** @hidden */
    protected _inlineCurrentValue$ = new BehaviorSubject<boolean>(false);

    /** @hidden */
    protected _responsiveBreakPointConfig: ResponsiveBreakPointConfig;

    /** @hidden */
    private _inlineLayout: InlineLayout;

    /** @hidden */
    private _xlIsInline: boolean;

    /** @hidden */
    private _lgIsInline: boolean;

    /** @hidden */
    private _mdIsInline: boolean;

    /** @hidden */
    private _sIsInline: boolean;

    /** @hidden */
    private _isInLineLayoutEnabled = false;

    constructor(
        cd: ChangeDetectorRef,
        readonly _responsiveBreakpointsService: ResponsiveBreakpointsService,
        @Optional() @Self() readonly ngControl: NgControl,
        @Optional() @SkipSelf() readonly ngForm: NgForm,
        @Optional() @SkipSelf() @Host() formField: FormField,
        @Optional() @SkipSelf() @Host() formControl: FormFieldControl<any>,
        @Optional()
        @Inject(RESPONSIVE_BREAKPOINTS_CONFIG)
        readonly _defaultResponsiveBreakPointConfig?: ResponsiveBreakPointConfig
    ) {
        super(cd, ngControl, ngForm, formField, formControl);

        this._responsiveBreakPointConfig = _defaultResponsiveBreakPointConfig || new ResponsiveBreakPointConfig();
    }

    /** @hidden */
    ngOnInit(): void {
        super.ngOnInit();

        if (this._isInLineLayoutEnabled) {
            this._responsiveBreakpointsService
                .observeBreakpointByConfig(this._responsiveBreakPointConfig)
                .subscribe((breakPointName) => {
                    this._updateLayout(breakPointName);
                });
        }
    }

    /** @hidden set values of inline for each screen layout */
    private _setFieldLayout(inlineLayout: InlineLayout): void {
        try {
            this._sIsInline = !!inlineLayout['S'];
            this._mdIsInline = !!inlineLayout['M'];
            this._lgIsInline = !!inlineLayout['L'];
            this._xlIsInline = !!inlineLayout['XL'];
        } catch (error) {
            this._isInLineLayoutEnabled = false;
        }
    }

    /** @hidden */
    private _updateLayout(currentBreakingPointName: string): void {
        if (this._isInLineLayoutEnabled) {
            switch (currentBreakingPointName) {
                case 'S':
                    this._inlineCurrentValue$.next(this._sIsInline);
                    break;
                case 'M':
                    this._inlineCurrentValue$.next(this._mdIsInline);
                    break;
                case 'L':
                    this._inlineCurrentValue$.next(this._lgIsInline);
                    break;
                case 'XL':
                    this._inlineCurrentValue$.next(this._xlIsInline);
                    break;
                default:
                    this._inlineCurrentValue$.next(this._xlIsInline);
            }
        }
    }
}
