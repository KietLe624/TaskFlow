import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTaskDetail } from './page-task-detail';

describe('PageTaskDetail', () => {
  let component: PageTaskDetail;
  let fixture: ComponentFixture<PageTaskDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTaskDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageTaskDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
