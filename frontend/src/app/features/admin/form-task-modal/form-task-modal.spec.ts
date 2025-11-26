import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTaskModal } from './form-task-modal';

describe('FormTaskModal', () => {
  let component: FormTaskModal;
  let fixture: ComponentFixture<FormTaskModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTaskModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTaskModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
