import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormProjectModal } from './form-project-modal';

describe('FormProjectModal', () => {
  let component: FormProjectModal;
  let fixture: ComponentFixture<FormProjectModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormProjectModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormProjectModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
