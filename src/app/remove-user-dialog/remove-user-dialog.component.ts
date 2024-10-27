
import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-remove-user-dialog',
  templateUrl: './remove-user-dialog.component.html',
  styleUrl: './remove-user-dialog.component.scss'
})
export class RemoveUserDialogComponent {
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: { childData: string },
  public firestoreService: FirestoreService,  
  private router: Router,
  public dialogRef: MatDialogRef<RemoveUserDialogComponent>,
) {}
  @Input() childData!: string;







  async deleteUser(userIdInput: string) {
    if (userIdInput) {
      try {
        await this.firestoreService.deleteSingleUser(userIdInput);
        console.log(`User with ID ${userIdInput} deleted successfully.`);
        this.router.navigate(['user']); // Redirect to the 'user' route after successful deletion
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
    this.dialogRef.close();
  }






}
