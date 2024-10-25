export class User {
  id?: string; 
  firstName: string;
  lastName: string;
  email: string;
  birthDate: number;
  street: string;
  zipCode: number;
  city: string;
  company: string;
  occupation: string;
  licenses: { [key: string]: number }; // License X: Expiration Date
  customData: { [key: string]: any };  // Title1: Data1, Title2: Data2

  constructor(obj?: any) {
      this.id = obj?.id || '';
      this.firstName = obj?.firstName || '';
      this.lastName = obj?.lastName || '';
      this.email = obj?.email || '';
      this.birthDate = obj?.birthDate || 0;
      this.street = obj?.street || '';
      this.zipCode = obj?.zipCode || '';
      this.city = obj?.city || '';
      this.company = obj?.company || '';
      this.occupation = obj?.occupation || '';
      this.licenses = obj?.licenses || {};
      this.customData = obj?.customData || {};
  }

  public toJSON() {
      return {
          id: this.id,
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          birthDate: this.birthDate,
          street: this.street,
          zipCode: this.zipCode,
          city: this.city,
          company: this.company,
          occupation: this.occupation,
          licenses: this.licenses,
          customData: this.customData
      };
  }
}


// export class User {
//     id?: string; 
//     firstName: string;
//     lastName: string;
//     email: string;
//     birthDate: number;
//     street: string;
//     zipCode: number;
//     city: string;
  
//     constructor(obj?: any) {
//       this.id = obj?.id || '';
//       this.firstName = obj?.firstName || '';
//       this.lastName = obj?.lastName || '';
//       this.email = obj?.email || '';
//       this.birthDate = obj?.birthDate || 0;
//       this.street = obj?.street || '';
//       this.zipCode = obj?.zipCode || '';
//       this.city = obj?.city || '';
//     }
  
//     public toJSON() {
//       return {
//         id: this.id, 
//         firstName: this.firstName,
//         lastName: this.lastName,
//         email: this.email,
//         birthDate: this.birthDate,
//         street: this.street,
//         zipCode: this.zipCode,
//         city: this.city
//       };
//     }
//   }