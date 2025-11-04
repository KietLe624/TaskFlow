import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCreateProject } from './form-create-project';

describe('FormCreateProject', () => {
  let component: FormCreateProject;
  let fixture: ComponentFixture<FormCreateProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCreateProject]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCreateProject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
