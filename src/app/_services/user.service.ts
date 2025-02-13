import { Injectable } from '@angular/core';

import { User } from '@app/_models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor() {}

  getAll() {
    // return this.http.get<User[]>(`/users`);
  }

  getById(id: number) {
    // return this.http.get(`/users/` + id);
  }

  register(user: User) {
    // return this.http.post(`/users/register`, user);
  }

  update(user: User) {
    // return this.http.put(`/users/` + user.id, user);
  }

  delete(id: number) {
    // return this.http.delete(`/users/` + id);
  }
}
