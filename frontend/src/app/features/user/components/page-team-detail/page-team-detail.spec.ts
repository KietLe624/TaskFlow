import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTeamDetail } from './page-team-detail';

describe('PageTeamDetail', () => {
  let component: PageTeamDetail;
  let fixture: ComponentFixture<PageTeamDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTeamDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageTeamDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
