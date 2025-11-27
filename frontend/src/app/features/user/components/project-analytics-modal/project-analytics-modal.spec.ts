import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAnalyticsModal } from './project-analytics-modal';

describe('ProjectAnalyticsModal', () => {
  let component: ProjectAnalyticsModal;
  let fixture: ComponentFixture<ProjectAnalyticsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectAnalyticsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectAnalyticsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
