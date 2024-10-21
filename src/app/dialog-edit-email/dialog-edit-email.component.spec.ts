import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditEmailComponent } from './dialog-edit-email.component';

describe('DialogEditEmailComponent', () => {
  let component: DialogEditEmailComponent;
  let fixture: ComponentFixture<DialogEditEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogEditEmailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogEditEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
