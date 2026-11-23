import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  MultirowTableComponent,
  MultirowTableItem,
} from './multirow-table.component';

describe('MultirowTableComponent', () => {
  let component: MultirowTableComponent;
  let fixture: ComponentFixture<MultirowTableComponent>;

  const mockItems: MultirowTableItem[] = [
    {
      name: 'Agent A: Food',
      color: '#5470c6',
      total: 1500.5,
      percentage: 75.0,
    },
    {
      name: 'Agent B: Travel',
      color: '#91cc75',
      total: 500.17,
      percentage: 25.0,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultirowTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MultirowTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render anything when items list is empty', () => {
    component.items = [];
    fixture.detectChanges();

    const summaryBar = fixture.debugElement.query(By.css('.summary-bar'));
    expect(summaryBar).toBeNull();
  });

  it('should render title, item count, formatted total, and currency code', () => {
    component.title = 'Visible Areas';
    component.items = mockItems;
    component.total = 2000.67;
    component.currencyCode = 'RUB';
    fixture.detectChanges();

    const titleEl = fixture.debugElement.query(
      By.css('.summary-title'),
    ).nativeElement;
    const totalEl = fixture.debugElement.query(
      By.css('.summary-total'),
    ).nativeElement;

    expect(titleEl.textContent).toContain('Visible Areas (2)');
    expect(totalEl.textContent).toContain('Total: 2,000.67 RUB');
  });

  it('should render all rows with their names, colors, amounts, and percentages', () => {
    component.items = mockItems;
    component.total = 2000.67;
    component.currencyCode = 'USD';
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.summary-row'));
    expect(rows.length).toBe(2);

    const firstRowText = rows[0].nativeElement.textContent;
    expect(firstRowText).toContain('Agent A: Food');
    expect(firstRowText).toContain('1,500.50 USD');
    expect(firstRowText).toContain('75.0%');

    const dotEl = rows[0].query(By.css('span.rounded-full')).nativeElement;
    expect(dotEl.style.backgroundColor).toBe('rgb(84, 112, 198)');
  });

  it('should position hoverStrip and emit rowHover when entering a row', () => {
    component.items = mockItems;
    fixture.detectChanges();

    const hoverSpy = jest.spyOn(component.rowHover, 'emit');
    const firstRow = fixture.debugElement.queryAll(By.css('.summary-row'))[0];

    const mockElement = firstRow.nativeElement as HTMLElement;
    Object.defineProperties(mockElement, {
      offsetLeft: { value: 12 },
      offsetTop: { value: 24 },
      offsetWidth: { value: 300 },
      offsetHeight: { value: 28 },
    });

    firstRow.triggerEventHandler('mouseenter', { currentTarget: mockElement });
    fixture.detectChanges();

    expect(component.hoverStrip).toEqual({
      visible: true,
      x: 12,
      y: 24,
      width: 300,
      height: 28,
    });
    expect(hoverSpy).toHaveBeenCalledTimes(1);
    expect(hoverSpy).toHaveBeenCalledWith('Agent A: Food');

    // Re-entering the same row should not emit duplicate events
    firstRow.triggerEventHandler('mouseenter', { currentTarget: mockElement });
    expect(hoverSpy).toHaveBeenCalledTimes(1);
  });

  it('should update hoverStrip coordinates on mousemove', () => {
    component.items = mockItems;
    fixture.detectChanges();

    component.hoverStrip.visible = true;
    const mockElement = { offsetLeft: 40, offsetTop: 60 } as HTMLElement;

    component.onRowMove({
      currentTarget: mockElement,
    } as unknown as MouseEvent);

    expect(component.hoverStrip.x).toBe(40);
    expect(component.hoverStrip.y).toBe(60);
  });

  it('should hide hoverStrip and emit null on grid mouseleave', () => {
    component.items = mockItems;
    fixture.detectChanges();

    const hoverSpy = jest.spyOn(component.rowHover, 'emit');
    const gridEl = fixture.debugElement.query(By.css('.summary-grid'));
    const firstRow = fixture.debugElement.queryAll(By.css('.summary-row'))[0];

    firstRow.triggerEventHandler('mouseenter', {
      currentTarget: firstRow.nativeElement,
    });
    hoverSpy.mockClear();

    gridEl.triggerEventHandler('mouseleave', null);
    fixture.detectChanges();

    expect(component.hoverStrip.visible).toBe(false);
    expect(hoverSpy).toHaveBeenCalledTimes(1);
    expect(hoverSpy).toHaveBeenCalledWith(null);
  });
});
