import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, defer } from 'rxjs';
import { User } from '@app/_models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Store authentication data
  private _authenticated: boolean;
  private _expiresAt: number;
  private _accessToken: string;
  private _userProfile: User;
  private _error: boolean;

  constructor(private router: Router) {
    this._init();
    this.checkAuthentication();
  }

  /**
   *
   *
   */
  private _init(): void {
    this._authenticated = null;
    this._expiresAt = null;
    this._accessToken = '';
    this._userProfile = null;
    this._error = null;
  }

  checkAuthentication(callback: Function = null): void {
    this._getAccessToken()
      .then(res => {
        if (res) {
          return this._getUserInfo(res);
        } else {
          callback && callback(false);
        }
      })
      .then(res => {
        if (res && res.authResult && res.profile) {
          this._setSession(res.authResult, res.profile);
          callback && callback(true);
        }
      })
      .catch(err => {
        console.log(err);
        return;
      });
  }

  private _getAccessToken(): Promise<any> {
    const token = localStorage.getItem('autho-token');
    return new Promise((resolve, reject) => {
      if (!token || !token.length) {
        return resolve();
      }

      const xhr = new XMLHttpRequest();
      xhr.addEventListener('load', e => {
        console.log('load');

        if (xhr.status !== 200) {
          console.log(xhr.responseText);
          return reject(xhr.responseText);
        }

        const res = JSON.parse(xhr.response);

        if (res.auth) {
          return resolve(res.auth);
        }
      });
      xhr.addEventListener('error', e => {
        console.log('error');
        return reject('Request error');
      });
      xhr.addEventListener('abort', e => {
        console.log('abort');
        return reject('Request aborted');
      });

      xhr.open('GET', 'http://localhost:3000/api/auth/check', true);
      xhr.setRequestHeader('X-Auth-Token', token);
      xhr.send();
    });
  }

  // Use access token to retrieve user's profile and set session
  private _getUserInfo(authResult: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener('load', e => {
        console.log('load');

        if (xhr.status !== 200) {
          console.log(xhr.responseText);
          return reject(xhr.responseText);
        }

        const res = JSON.parse(xhr.response);

        if (res.profile) {
          return resolve({ authResult, profile: res.profile });
        }
      });
      xhr.addEventListener('error', e => {
        console.log('error');
        return reject('Request error');
      });
      xhr.addEventListener('abort', e => {
        console.log('abort');
        return reject('Request aborted');
      });

      xhr.open('GET', `http://localhost:3000/api/auth/${authResult.id}/profile`, true);
      xhr.setRequestHeader('X-Auth-Token', authResult.accessToken);
      xhr.send();
    });
  }

  private _setSession(authResult: any, profile: any): any {
    // Save authentication data and update login status subject
    this._expiresAt = authResult.expiresIn * 1000 + Date.now();
    this._accessToken = authResult.accessToken;
    this._userProfile = { id: profile.id, name: profile.name, email: profile.email };
    this._authenticated = true;

    localStorage.setItem('autho-token', this._accessToken);
  }

  /**
   *
   *
   */
  // isLoggedIn(): Observable<boolean> {
  //   return defer(() =>
  //     from(
  //       new Promise((resolve, reject) => {
  //         if (this._expiresAt !== null && this._authenticated !== null) {
  //           return resolve(Date.now() < this._expiresAt && this._authenticated);
  //         } else {
  //           this._checkAuthentication((expiresAt, authenticated) => {
  //             return resolve(Date.now() < expiresAt && authenticated);
  //           });
  //         }
  //       })
  //     )
  //   );
  // }

  get isLoggedIn(): boolean {
    return Date.now() < this._expiresAt && this._authenticated;
  }

  get accessToken(): string {
    return this._accessToken;
  }

  login$(email: string, password: string): Observable<boolean> {
    return defer(() =>
      from(
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.addEventListener('load', e => {
            console.log('load');

            if (xhr.status !== 200) {
              return reject(xhr.responseText);
            }

            const res = JSON.parse(xhr.response);

            if (res.auth) {
              this._init();
              this._getUserInfo(res.auth)
                .then(obj => {
                  if (obj && obj.authResult && obj.profile) {
                    this._setSession(obj.authResult, obj.profile);
                    return resolve(true);
                  }
                })
                .catch(err => {
                  console.log(err);
                  return reject(err);
                });
            }
          });
          xhr.addEventListener('error', e => {
            console.log('error');
            return reject('Request error');
          });
          xhr.addEventListener('abort', e => {
            console.log('abort');
            return reject('Aborted request');
          });

          xhr.open('POST', 'http://localhost:3000/api/auth/login', true);
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhr.send(`email=${email}&password=${password}`);
        })
      )
    );
  }

  logout() {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', e => {
      console.log('load');

      if (xhr.status !== 200) {
        console.log(xhr.responseText);
        return;
      }
      this._init();
      localStorage.removeItem('autho-token');

      // setTimeout(() => {
      this.router.navigate(['/']);
      // }, 5000);
    });
    xhr.addEventListener('error', e => {
      console.log('error');
      return;
    });
    xhr.addEventListener('abort', e => {
      console.log('abort');
      return;
    });

    xhr.open('GET', 'http://localhost:3000/api/auth/logout', true);
    xhr.setRequestHeader('X-Auth-Token', this._accessToken);
    xhr.send();
  }
}
