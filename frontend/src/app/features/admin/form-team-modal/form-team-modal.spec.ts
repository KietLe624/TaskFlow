import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTeamModalComponent } from './form-team-modal';

describe('FormTeamModal', () => {
  let component: FormTeamModalComponent;
  let fixture: ComponentFixture<FormTeamModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTeamModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTeamModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
