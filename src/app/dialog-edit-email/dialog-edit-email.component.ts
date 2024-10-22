import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';

import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-dialog-edit-email',
  templateUrl: './dialog-edit-email.component.html',
  styleUrl: './dialog-edit-email.component.scss'
})
export class DialogEditEmailComponent {
  user: User = new User();
  birthDate: Date | undefined;
  // loading = false;

  constructor(
    public dialogRef: MatDialogRef<DialogEditEmailComponent>,
    public firestoreService: FirestoreService 
   
  ){
  
  }
  
  cancelDialog(){
    this.dialogRef.close();
  }
  
  saveUser(){
    this.firestoreService.user = this.user;
    this.firestoreService.saveUser(this.dialogRef);
  }

  
  
  }
  

