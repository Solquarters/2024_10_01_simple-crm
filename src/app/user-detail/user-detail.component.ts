

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../models/user.class';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditEmailComponent } from '../dialog-edit-email/dialog-edit-email.component';
import { DialogEditAddressComponent } from '../dialog-edit-address/dialog-edit-address.component';
import { FirestoreService } from '../firestore.service';
import { AddLicenceDialogComponent } from '../add-licence-dialog/add-licence-dialog.component';



@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
 
})
export class UserDetailComponent implements OnInit{

  Object = Object;
  userId: string | null = '';

  constructor(
    private route: ActivatedRoute, 
    public dialog: MatDialog,
    public firestoreService: FirestoreService,  
    
  ) {}

  // ngOnInit(): void {
  //   this.route.paramMap.subscribe(paramMap => {
  //     this.userId = paramMap.get('id');
  //     console.log('got id', this.userId);
  //     if (this.userId) {
  //       this.getSingleUser(this.userId);
  //       this.firestoreService.user.id = this.userId;
  //     }
  //   });
  // }

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');
      this.userId = id ? id : ''; // Provide an empty string as fallback if id is null
      console.log('got id', this.userId);
      if (this.userId) {
        this.getSingleUser(this.userId);
        this.firestoreService.user.id = this.userId;
      }
    });
  }

  // ngOnChanges(){
  //   this.route.paramMap.subscribe(paramMap => {
  //     this.userId = paramMap.get('id');
  //     console.log('OnChanges triggered, got id', this.userId);
  //     if (this.userId) {
  //       this.getSingleUser(this.userId);
  //       this.firestoreService.user.id = this.userId;
  //     }
  //   });

  // }

  async getSingleUser(idInput: string){
    await this.firestoreService.getSingleUser(idInput);
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
    if(this.userId){
      this.firestoreService.user.id = this.userId;
    }
    
    this.firestoreService.user.licenses = this.firestoreService.user.licenses.filter(license => license.licenseId !== licenseIdInput);
   
    
    console.log(this.firestoreService.user.licenses);
    console.log('User ID in firestore.user:',this.firestoreService.user.id);
    console.log('User ID in user-detail user:',this.userId);
    if(this.firestoreService.user.id){
      this.firestoreService.updateUser(this.firestoreService.user.id);
    }
  }


  openLicenceDialog(){
    this.dialog.open(AddLicenceDialogComponent);
  }

  deleteUser(userIdInput:string){
    if(this.userId){
      this.firestoreService.deleteSingleUser(userIdInput);
    }
   
  }
}
