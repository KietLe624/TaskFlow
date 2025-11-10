import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTeamComponent } from './form-team';

describe('FormTeam', () => {
  let component: FormTeamComponent;
  let fixture: ComponentFixture<FormTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
