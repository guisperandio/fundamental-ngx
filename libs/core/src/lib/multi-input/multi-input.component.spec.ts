import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MultiInputComponent, MultiInputModule } from '@fundamental-ngx/core/multi-input';
import {
    ContentDensityService,
    DEFAULT_CONTENT_DENSITY,
    DynamicComponentService,
    RtlService
} from '@fundamental-ngx/core/utils';

describe('MultiInputComponent', () => {
    let component: MultiInputComponent;
    let fixture: ComponentFixture<MultiInputComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [MultiInputModule],
                providers: [DynamicComponentService, RtlService, ContentDensityService]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(MultiInputComponent);
        component = fixture.componentInstance;
        component.dropdownValues = ['displayedValue', 'displayedValue2'];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle content density when compact input is not provided', () => {
        spyOn(component, 'buildComponentCssClass');
        component.ngOnInit();
        expect(component.compact).toBe(DEFAULT_CONTENT_DENSITY !== 'cozy');
        expect(component.buildComponentCssClass).toHaveBeenCalled();
    });

    it('should set placeholder', async () => {
        await fixture.whenStable();

        const placeholder = 'placeholder';
        component.placeholder = placeholder;
        (component as any)._changeDetRef.markForCheck();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('input').placeholder).toBe(placeholder);
    });

    it('should handle search term change', async () => {
        await fixture.whenStable();
        spyOn(component.searchTermChange, 'emit');
        spyOn(component, 'filterFn');
        spyOn(component, 'openChangeHandle');
        component.ngOnInit();

        const text = 'test';
        const inputElement = fixture.nativeElement.querySelector('.fd-input');
        inputElement.value = text;
        inputElement.dispatchEvent(new Event('input'));

        expect(component.searchTerm).toBe(text);
        expect(component.searchTermChange.emit).toHaveBeenCalled();
        expect(component.filterFn).toHaveBeenCalled();
        expect(component.openChangeHandle).toHaveBeenCalledWith(true);
    });

    it('should filter dropdown values', async () => {
        await fixture.whenStable();
        component.dropdownValues = ['test1', 'test2', 'foobar'];
        component.ngOnInit();

        spyOn(component, 'filterFn').and.callThrough();

        const text = 'foo';
        const inputElement = fixture.nativeElement.querySelector('.fd-input');
        inputElement.value = text;
        inputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(component.filterFn).toHaveBeenCalled();
        expect(component.displayedValues.length).toBe(1);
        expect(component.dropdownValues.length).toBe(3);
    });

    it('should open/close popover on input addon click', async () => {
        await fixture.whenStable();
        component.dropdownValues = ['test1', 'test2', 'foobar'];
        component.ngOnInit();
        component.open = false;

        const inputButtonElement = fixture.nativeElement.querySelector('.fd-input-group__button');
        inputButtonElement.click();
        fixture.detectChanges();
        expect(component.open).toBe(true);

        inputButtonElement.click();
        fixture.detectChanges();

        expect(component.open).toBe(false);
    });

    it('should select values', async () => {
        await fixture.whenStable();
        spyOn(component.selectedChange, 'emit');
        spyOn(component, 'onChange');
        spyOn(component, '_handleSelect').and.callThrough();
        component.dropdownValues = ['test1', 'test2', 'foobar'];
        component.ngOnInit();
        fixture.detectChanges();
        component.open = true;
        fixture.detectChanges();

        (component as any)._changeDetRef.markForCheck();
        component.selected = ['test1'];
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('fd-token')).toBeTruthy();
    });

    it('should de-select values', async () => {
        await fixture.whenStable();
        spyOn(component.selectedChange, 'emit');
        spyOn(component, 'onChange');
        spyOn(component, '_handleSelect').and.callThrough();
        component.dropdownValues = ['test1', 'test2', 'foobar'];
        component.ngOnInit();
        component.open = true;
        fixture.detectChanges();

        component.selected = ['test1'];
        fixture.detectChanges();

        expect(component.selected.length).toBe(1);
        expect(component.selected[0]).toBe('test1');

        component.selected = [];
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('fd-token')).toBeFalsy();
    });

    it('should bring back values, if canceled on mobile mode and dont emit changes', async () => {
        component.mobile = true;

        spyOn(component, 'onChange');
        spyOn(component.selectedChange, 'emit');

        await fixture.whenStable();

        component._handleSelect(true, component.dropdownValues[0]);

        expect(component.onChange).not.toHaveBeenCalled();
        expect(component.selectedChange.emit).not.toHaveBeenCalled();

        expect(component.selected).toEqual([component.dropdownValues[0]]);

        component.dialogDismiss([]);

        expect(component.selected).toEqual([]);
    });

    it('should emit changes values on approve', async () => {
        component.mobile = true;

        spyOn(component, 'onChange');
        spyOn(component.selectedChange, 'emit');

        await fixture.whenStable();

        component._handleSelect(true, component.dropdownValues[0]);

        expect(component.onChange).not.toHaveBeenCalled();
        expect(component.selectedChange.emit).not.toHaveBeenCalled();
        expect(component.selected).toEqual([component.dropdownValues[0]]);

        component.dialogApprove();

        expect(component.onChange).toHaveBeenCalled();
        expect(component.selectedChange.emit).toHaveBeenCalled();
        expect(component.selected).toEqual([component.dropdownValues[0]]);
    });

    it('should focus the input and clear the search term after selection', async () => {
        const inputFocusSpy = spyOn(component.searchInputElement.nativeElement, 'focus');

        await fixture.whenStable();

        component.searchTerm = 'search';

        component._handleSelect(true, component.dropdownValues[0]);

        expect(inputFocusSpy).toHaveBeenCalled();
        expect(component.searchTerm).toBe('');
    });

    it('should handle showAll button', async () => {
        await fixture.whenStable();
        const event = new MouseEvent('click');
        component.searchTerm = 'term';
        component.dropdownValues = ['term1', 'term2', 'value'];
        spyOn(event, 'preventDefault');
        spyOn(event, 'stopPropagation');
        spyOn(<any>component, '_applySearchTermChange').and.callThrough();
        component._showAllClicked(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(component.searchTerm).toBe('');
        expect(component.displayedValues.length).toEqual(component.dropdownValues.length);
        expect((<any>component)._applySearchTermChange).toHaveBeenCalled();
    });
});
