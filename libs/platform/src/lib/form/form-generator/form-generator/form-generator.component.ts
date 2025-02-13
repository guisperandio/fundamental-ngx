import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    isDevMode,
    OnDestroy,
    Output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { ColumnLayout, LabelLayout } from '@fundamental-ngx/platform/shared';

import { FormGeneratorService } from '../form-generator.service';
import { DynamicFormItem, DynamicFormValue } from '../interfaces/dynamic-form-item';
import { DynamicFormControl, DynamicFormControlGroup, DynamicFormGroupControls } from '../dynamic-form-control';
import { DynamicFormGroup } from '../interfaces/dynamic-form-group';
import {
    DefaultGapLayout,
    DefaultHorizontalFieldLayout,
    DefaultHorizontalLabelLayout,
    DefaultVerticalFieldLayout,
    DefaultVerticalLabelLayout
} from '../../form-group/constants';

let formUniqueId = 0;

export interface SubmitFormEventResult {
    /**
     * @description Indicator if validation has been passed.
     */
    success: boolean;
    /**
     * @description Formatted form value.
     */
    value: DynamicFormValue;
}

/**
 * @description Form Generator component represents a high-level component
 * which includes @see FormGroup inside.
 */
@Component({
    selector: 'fdp-form-generator',
    templateUrl: './form-generator.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormGeneratorComponent implements OnDestroy {
    /**
     * @description Renderer for the custom html code passed into the component.
     */
    @ViewChild('renderer', { static: false })
    renderer: TemplateRef<any>;

    /** @description Unique form name */
    @Input()
    formName = `fdp-form-generator-${formUniqueId++}`;

    /**
     * @description List of @see DynamicFormItem representing the list of items
     * to be rendered in the form.
     */
    @Input()
    get formItems(): DynamicFormItem[] {
        return this._formItems;
    }

    set formItems(formItems: DynamicFormItem[]) {
        this._formItems = formItems.map((item, index) => {
            item = { ...item };

            item.rank = item.rank || index;

            return item;
        });
        this._generateForm();
    }

    /**
     * @description Form main title.
     */
    @Input()
    mainTitle: string;

    /**
     * @description Specify the column layout in the format `XLn-Ln-Mn-Sn`
     * where n is the number of columns and can be different for each size.
     * eg: XL2-L2-M2-S1 would create 2-column layouts for XL, L,
     * and M sizes and single-column layout for S size.
     */
    @Input()
    columnLayout: string;

    /**
     * @deprecated
     * Use labelColumnLayout, fieldColumnLayout and gapColumnLayout properties.
     *
     * Defines form field label placement.
     */
    @Input()
    get labelLayout(): LabelLayout {
        return this._labelLayout;
    }

    set labelLayout(value: LabelLayout) {
        if (isDevMode()) {
            console.warn(
                'LabelLayout input property is deprecated. Please use labelColumnLayout, fieldColumnLayout and gapColumnLayout properties instead'
            );
        }
        this._labelLayout = value;

        this.labelColumnLayout =
            this._labelLayout === 'horizontal' ? DefaultHorizontalLabelLayout : DefaultVerticalLabelLayout;
        this.fieldColumnLayout =
            this._labelLayout === 'horizontal' ? DefaultHorizontalFieldLayout : DefaultVerticalFieldLayout;
    }

    /**
     * Defines label's column layout.
     */
    @Input()
    labelColumnLayout: ColumnLayout = DefaultVerticalLabelLayout;

    /**
     * Defines field's column layout.
     */
    @Input()
    fieldColumnLayout: ColumnLayout = DefaultVerticalFieldLayout;

    /**
     * Defines gap column layout.
     */
    @Input()
    gapColumnLayout: ColumnLayout = DefaultGapLayout;

    /** Whether or not all form items should have identical layout provided for form group. */
    @Input()
    unifiedLayout = true;

    /**
     * @description Event which notifies parent component that the form has been successfuly created
     * and all controls are in place.
     */
    @Output()
    formCreated = new EventEmitter<FormGroup>();

    /**
     * @description Event which notifies parent component that the form has been successfuly validated
     * and submitted. Contains form
     */
    @Output()
    formSubmitted = new EventEmitter<DynamicFormValue>();

    /**
     * @description Event which notifies parent component that the form was submitted.
     */
    @Output()
    formSubmittedStatus = new EventEmitter<SubmitFormEventResult>();

    /**
     * @description Represents the form instance. @see NgForm
     */
    @ViewChild(NgForm)
    ngForm: NgForm;

    /**
     * @description Dynamically generated form. @see FormGeneratorService
     */
    form: DynamicFormGroup;
    /**
     * @description List of the form controls.
     */
    formControlItems: (DynamicFormControl | DynamicFormControlGroup)[];

    /**
     * Set of flags representing if particular form item should be visible to the user.
     */
    shouldShowFields: { [key: string]: boolean } = {};

    /**
     * Flag representing that form is loading
     */
    formLoading = true;

    /**
     * @hidden
     */
    private _formItems: DynamicFormItem[];

    /**
     * @hidden
     */
    private _formValueSubscription: Subscription;

    /**
     * @hidden
     * An RxJS Subject that will kill the data stream upon component’s destruction (for unsubscribing)
     */
    private readonly _onDestroy$: Subject<void> = new Subject<void>();

    /** @hidden */
    private _labelLayout: LabelLayout;

    constructor(private _fgService: FormGeneratorService, private _cd: ChangeDetectorRef) {}

    /**
     * @hidden
     */
    ngOnDestroy(): void {
        this._onDestroy$.next();
        this._onDestroy$.complete();
    }

    /**
     * @hidden
     */
    async _onSubmit(): Promise<void> {
        this.form.markAllAsTouched();
        this._cd.markForCheck();

        // stop here if form is invalid
        if (this.form.invalid || this.form.pending) {
            this.formSubmittedStatus.emit({ success: false, value: null });
            return;
        }

        const formValue = await this._fgService.getFormValue(this.form);

        this.formSubmitted.emit(formValue);
        this.formSubmittedStatus.emit({ success: true, value: formValue });

        this.form.markAsPristine();
    }

    /**
     * @hidden
     */
    _getErrors(errors: { [key: string]: any }): { type: string; value: any }[] {
        return Object.entries(errors).map((e) => {
            const errorType = e[0];
            let errorValue = e[1];

            const defaultErrorValue = this._fgService.getValidationErrorHints(errorType);

            if (defaultErrorValue) {
                errorValue = defaultErrorValue;
            }
            return { type: errorType, value: errorValue };
        });
    }

    /**
     * @hidden
     */
    private async _generateForm(): Promise<void> {
        this.formLoading = true;

        const form = await this._fgService.generateForm(this.formName, this.formItems);

        this._formValueSubscription?.unsubscribe();

        this.form = form;

        this.formControlItems = this._getOrderedControls(form.controls);

        this.shouldShowFields = await this._fgService.checkVisibleFormItems(this.form);

        this._formValueSubscription = this.form.valueChanges
            .pipe(debounceTime(50), takeUntil(this._onDestroy$))
            .subscribe(async () => {
                this.shouldShowFields = await this._fgService.checkVisibleFormItems(this.form);
                this._cd.markForCheck();
            });

        this.formLoading = false;

        this._cd.detectChanges();

        this.formCreated.emit(this.form);
    }

    /**
     *
     * @hidden
     */
    _trackFn(index: number, value: DynamicFormControl): string {
        return `${index}_${value.formItem.name}`;
    }

    /**
     *
     * @description Programmatically submit form.
     * This method also calls validation for the form items.
     */
    submit(): void {
        this.ngForm.ngSubmit.emit();
    }

    /** @hidden */
    _getOrderedControls(controls: DynamicFormGroupControls): (DynamicFormControl | DynamicFormControlGroup)[] {
        return Object.values(controls).sort((a, b) => (a.formItem.rank > b.formItem.rank ? 1 : -1));
    }
}
