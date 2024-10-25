

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/user.class';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditEmailComponent } from '../dialog-edit-email/dialog-edit-email.component';
import { DialogEditAddressComponent } from '../dialog-edit-address/dialog-edit-address.component';
import { FirestoreService } from '../firestore.service';


@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit{

  Object = Object;
  // user: User = new User();
  userId: string | null = '';

  constructor(
    private route: ActivatedRoute, 
    // private firestore: Firestore,
    public dialog: MatDialog,
    public firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      this.userId = paramMap.get('id');
      console.log('got id', this.userId);
      if (this.userId) {
        this.getSingleUser(this.userId);
      }
    });
  }

  getSingleUser(idInput: string){
    this.firestoreService.getSingleUser(idInput);
  }

  openAddressDialog(){
    ///Make the child dialog editAddress access the parent variable user: 
    const editAddressDialog = this.dialog.open(DialogEditAddressComponent);

    ///Pass on user Object to child dialog or component instance
    // editAddressDialog.componentInstance.user = this.user;

    //Implementing a copy of the user data without referencing its content through new object instantiation 
    //and turning it into a json object
    editAddressDialog.componentInstance.user = new User(this.firestoreService.user.toJSON()) ;
    if (this.userId) {
      editAddressDialog.componentInstance.user.id = this.userId;
    }
    
  };

  openEmailDialog(){
    // this.dialog.open(DialogEditEmailComponent);

        ///Make the child dialog editAddress access the parent variable user: 
        const editEmailDialog = this.dialog.open(DialogEditEmailComponent);

        ///Pass on user Object to child dialog or component instance
        editEmailDialog.componentInstance.user = new User(this.firestoreService.user.toJSON());

        if (this.userId) {
          editEmailDialog.componentInstance.user.id = this.userId;
        }
        
  };

  openCustomerDetailsDialog(){

  }

  deleteSingleLicense(licenseIdInput: string) {
    this.firestoreService.user.licenses = this.firestoreService.user.licenses.filter(license => license.licenseId !== licenseIdInput);
  }
}
