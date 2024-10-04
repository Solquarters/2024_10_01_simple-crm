import { Component } from '@angular/core';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.scss'
})
export class DialogAddUserComponent {

  user: User = new User();

  birthDate: Date | undefined;

  saveUser(){
    if(this.birthDate){
      this.user.birthDate = this.birthDate.getTime();
    }
    console.log(this.user);

  }
}
