import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLicToEmptyUserComponent } from './add-lic-to-empty-user.component';

describe('AddLicToEmptyUserComponent', () => {
  let component: AddLicToEmptyUserComponent;
  let fixture: ComponentFixture<AddLicToEmptyUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddLicToEmptyUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddLicToEmptyUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
