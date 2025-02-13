import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

import { ContentDensity } from '@fundamental-ngx/core/utils';
import { InlineLayout, ColumnLayout, HintPlacement, LabelLayout, SelectItem } from '@fundamental-ngx/platform/shared';
import { InputType } from '../../input/input.component';
import { DynamicFormGroup } from './dynamic-form-group';

export type DynamicFormItemChoices = number | string | SelectItem;
export type DynamicFormItemValidationResult = null | boolean | string;
export type DynamicFormItem = DynamicFormFieldGroup | DynamicFormFieldItem;

export interface DynamicFormFieldGroup {
    /**
     * @description
     * Name of the form item in form.
     */
    name: string;

    /**
     * @description
     * Display name of the form item.
     * @param formValue the form value hash.
     */
    message?: string;

    /**
     * @description
     * List of @see DynamicFormItem representing the list of items
     * to be rendered in the form.
     */
    items?: DynamicFormFieldItem[];

    /**
     * @description
     * Rank is used for ordering.
     * Than lower number then higher priority.
     */
    rank?: number;

    /**
     * @description
     * Additional set of options that can affect UI of the form field group.
     */
    guiOptions?: BaseDynamicFormItemGuiOptions;
}

/**
 * Dynamic form item object interface which is used for generating form controls of defined type with validation rules.
 */
export interface DynamicFormFieldItem {
    /**
     * @description
     * Type of the form item. E.g. input, textarea, checkbox, etc.
     */
    type: string;

    /**
     * @description
     * Additional set of options that can affect UI of the form item form control.
     */
    controlType?: InputType;

    /**
     * @description
     * Name of the form item in form.
     */
    name: string;

    /**
     * @description
     * Display name of the form item.
     * @param formValue the form value hash.
     */
    message: string | ((formValue?: DynamicFormValue) => string | Promise<string> | Observable<string>);

    /**
     * @description
     * Display placeholder of the form item.
     * @param formValue the form value hash.
     */
    placeholder?: string | ((formValue?: DynamicFormValue) => string | Promise<string> | Observable<string>);

    /**
     * @description
     * If true, will fallback to `message` property if `placeholder` was not provided.
     */
    useMessageAsPlaceholder?: boolean;

    /**
     * @description
     * Default value of the form item.
     */
    default?: any | ((formValue?: DynamicFormValue) => any | Promise<any> | Observable<any>);

    /**
     * @description
     * The list of available options to select.
     * @param formValue raw form item value.
     */
    choices?:
        | DynamicFormItemChoices[]
        | ((
              formValue?: DynamicFormValue
          ) => DynamicFormItemChoices[] | Promise<DynamicFormItemChoices[]> | Observable<DynamicFormItemChoices[]>);

    /**
     * @description
     * Receive the user input and form value hash.
     * Should return null if the value is valid, and an error message (String) or `false` otherwise.
     * If `false` is returned, a default error message is provided.
     * @param formItemValue raw form item value.
     * @param formValue the form value hash.
     * @returns null or String
     */
    validate?: (
        formItemValue?: any,
        formValue?: DynamicFormValue
    ) =>
        | DynamicFormItemValidationResult
        | Promise<DynamicFormItemValidationResult>
        | Observable<DynamicFormItemValidationResult>;

    /**
     * @description
     * The list of validators applied to the form item.
     */
    validators?: ValidatorFn[] | null;

    /**
     * @description
     * The list of async validators applied to the form item.
     */
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null;

    /**
     * @description Set when form item is a mandatory one.
     */
    required?: boolean;

    /**
     * @description Transforms raw form item value.
     * @param formItemValue raw form item value.
     * @param formValue the form value hash.
     * @param formItem @see DynamicFormFieldItem
     * @returns updated form item value to be used in the form value hash.
     */
    transformer?: (
        formItemValue?: any,
        formValue?: DynamicFormValue,
        formItem?: DynamicFormFieldItem
    ) => any | Promise<any>;

    /**
     * @description Transforms raw form item value for render purposes.
     * @param formItemValue raw form item value.
     * @param formValue the form value hash.
     * @param formItem @see DynamicFormFieldItem
     * @returns updated form item value to be used in the form value hash for rendering purposes.
     */
    valueRenderer?: (
        formItemValue?: any,
        formValue?: DynamicFormValue,
        formItem?: DynamicFormFieldItem
    ) => any | Promise<any>;

    /**
     * @description Should return true or false depending on whether or not this form item should be asked.
     * @param formValue the form value hash.
     * @returns Boolean
     */
    when?: (formValue?: DynamicFormValue) => boolean | Promise<boolean> | Observable<boolean>;

    /**
     * @description Callback function that is triggered after field value has been changed.
     * @param fieldValue Field value.
     * @param formGeneratorService Form generator service instance.
     */
    onchange?: (fieldValue?: any, forms?: Map<string, DynamicFormGroup>) => void | Promise<void> | Observable<void>;

    /**
     * @hidden
     * @description
     * Used as a static flag on should this form item be shown.
     */
    shouldShow?: boolean;

    /**
     * @description
     * Additional set of options that can affect UI of the form item form control.
     */
    guiOptions?: DynamicFormItemGuiOptions;

    /**
     * @description
     * Rank is used for ordering.
     * Than lower number then higher priority.
     */
    rank?: number;
}

export interface BaseDynamicFormItemGuiOptions {
    /**
     * @description
     * Defines label's column layout.
     */
    labelColumnLayout?: ColumnLayout;

    /**
     * @description
     * Defines field's column layout.
     */
    fieldColumnLayout?: ColumnLayout;

    /**
     * @description
     * Defines gap column layout.
     */
    gapColumnLayout?: ColumnLayout;
}

export interface DynamicFormItemGuiOptions extends BaseDynamicFormItemGuiOptions {
    /**
     * @description
     * Index of column if form has multi-column layout.
     */
    column?: number;

    /**
     * @description
     * Column arrangement for form-field based on screen size.
     */
    columnLayout?: ColumnLayout;

    /**
     * @description
     * Inline layout for list based form item.
     */
    inlineLayout?: InlineLayout;

    /**
     * @description
     * If set, hint icon is added to control label with tooltip message as a value.
     */
    hint?: string;

    /**
     * @description
     * Define hint placement.
     */
    hintPlacement?: HintPlacement;

    /**
     * @deprecated
     * Use labelColumnLayout, fieldColumnLayout and gapColumnLayout properties.
     * Define form field label placement.
     */
    layout?: LabelLayout;

    /**
     * @description
     * Flag indicating that label should be hidden.
     */
    noLabelLayout?: boolean;

    /**
     * @description
     * If set, controls inner elements will be inlined.
     */
    inline?: boolean;

    /**
     * @description
     * If set, overrides current content density of the element defined on the global scope.
     */
    contentDensity?: ContentDensity;

    /**
     * @description Object contains additional payload. Useful for custom elements to manipulate it's view.
     */
    additionalData?: any;

    /**
     * @description
     * If label should be appended with colon. True by default.
     */
    appendColon?: boolean;
}

export interface DynamicFormValue {
    [key: string]: any;
}
