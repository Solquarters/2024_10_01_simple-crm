import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLicenceDialogComponent } from './add-licence-dialog.component';

describe('AddLicenceDialogComponent', () => {
  let component: AddLicenceDialogComponent;
  let fixture: ComponentFixture<AddLicenceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddLicenceDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddLicenceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
