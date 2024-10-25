import { Component } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import {MatDialogRef} from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-add-licence-dialog',
  templateUrl: './add-licence-dialog.component.html',
  styleUrl: './add-licence-dialog.component.scss'
})
export class AddLicenceDialogComponent {

  licenseName: string = '';
  expirationDate: Date = new Date('');

  userId: string | null = '';

    
  constructor(private route: ActivatedRoute, public dialogRef: MatDialogRef<AddLicenceDialogComponent>,
    public firestoreService: FirestoreService  
  ){
  
  }
  
  // ngOnInit(): void {
  //   this.route.paramMap.subscribe(paramMap => {
  //     this.userId = paramMap.get('id');
  //     console.log('Add licence dialog Oninit triggered', this.userId);
  //     if (this.userId) {
  //       this.firestoreService.user.id = this.userId;
  //     }
  //   });
  // }

  
cancelLicenseDialog(){
  this.dialogRef.close();
}


submitLicense() {
  // Get the license name and expiration date in the desired format
  const licenseName = this.licenseName;
  const expirationDateValue = this.expirationDate.getTime(); // Convert to timestamp for Firestore
  const licenseId = this.generateBase64Sequence(length = 16);

  // Create the new license object
  const newLicense = { licenseName: licenseName, value: expirationDateValue, licenseId: licenseId};

  // Add the new license to the licenses array
  this.firestoreService.user.licenses.push(newLicense);

  if(this.firestoreService.user.id){
    this.firestoreService.updateUser(this.firestoreService.user.id);
  }
  

  // Close the dialog
  this.dialogRef.close();
}



generateBase64Sequence(length = 16) {
  const randomBytes = new Uint8Array(Math.ceil((length * 6) / 8)); // Calculate bytes needed
  crypto.getRandomValues(randomBytes); // Fill with random values

  // Encode to base-64 and truncate to desired length
  return btoa(String.fromCharCode(...randomBytes)).substring(0, length);
}

}
