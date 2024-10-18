

import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { FirestoreService } from '../firestore.service';
import { User } from '../../models/user.class';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent {

  constructor(
    public dialog: MatDialog,
    public firestoreService: FirestoreService
  ) {}

  ngOnInit() {
    this.firestoreService.initializeUsersArray();
  }

  openDialog() {
    this.dialog.open(DialogAddUserComponent);
  }


consoleOutputUsers() {
  console.log(this.firestoreService.usersArray);
}




}