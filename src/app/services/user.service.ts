import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor() {}

  getCurrentUser(): Observable<User> {
    // Mock user data - in a real app, this would come from an API
    const mockUser: User = {
      id: '1',
      name: 'Dr. Marie Dubois',
      email: 'marie.dubois@clinique-parc.fr',
      avatar: 'assets/public/images/avatars/doctor/doctor-avatar.jpg',
      role: 'Radiologist',
      department: 'Radiology'
    };

    return of(mockUser);
  }
}