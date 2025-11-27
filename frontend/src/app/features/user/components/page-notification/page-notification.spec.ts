import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNotification } from './page-notification';

describe('PageNotification', () => {
  let component: PageNotification;
  let fixture: ComponentFixture<PageNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
