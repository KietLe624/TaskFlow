import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageProjectDetail } from './page-project-detail';

describe('PageProjectDetail', () => {
  let component: PageProjectDetail;
  let fixture: ComponentFixture<PageProjectDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageProjectDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageProjectDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
