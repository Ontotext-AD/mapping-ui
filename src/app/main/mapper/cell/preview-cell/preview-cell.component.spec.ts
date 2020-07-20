import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewCellComponent } from './preview-cell.component';

describe('PreviewCellComponent', () => {
  let component: PreviewCellComponent;
  let fixture: ComponentFixture<PreviewCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
