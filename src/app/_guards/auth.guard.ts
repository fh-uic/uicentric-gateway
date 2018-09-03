import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, from, defer } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from '@app/_services/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise((resolve, reject) => {
      this.authService.checkAuthentication(authenticated => {
        if (!authenticated) {
          if (state.url !== '/') {
            this.router.navigate(['/']);
          }
          return reject(false);
        }
        return resolve(true);
      });
    });
  }
}
