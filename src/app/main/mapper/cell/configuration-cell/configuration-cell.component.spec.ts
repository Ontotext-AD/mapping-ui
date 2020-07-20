import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationCellComponent } from './configuration-cell.component';

describe('ConfigurationCellComponent', () => {
  let component: ConfigurationCellComponent;
  let fixture: ComponentFixture<ConfigurationCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigurationCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
