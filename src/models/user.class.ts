export class User {
    id?: string; 
    firstName: string;
    lastName: string;
    email: string;
    birthDate: number;
    street: string;
    zipCode: number;
    city: string;
  
    constructor(obj?: any) {
      this.id = obj?.id || '';
      this.firstName = obj?.firstName || '';
      this.lastName = obj?.lastName || '';
      this.email = obj?.email || '';
      this.birthDate = obj?.birthDate || 0;
      this.street = obj?.street || '';
      this.zipCode = obj?.zipCode || '';
      this.city = obj?.city || '';
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
        city: this.city
      };
    }
  }