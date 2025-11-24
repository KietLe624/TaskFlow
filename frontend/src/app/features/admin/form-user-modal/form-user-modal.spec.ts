import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormUserModal } from './form-user-modal';

describe('FormUserModal', () => {
  let component: FormUserModal;
  let fixture: ComponentFixture<FormUserModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormUserModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormUserModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
