import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthService, AlertService } from '@app/_services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading: boolean;
  submitted: boolean;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this._init();
  }

  private _init(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['', [Validators.required]]
    });
    this.loading = false;
    this.submitted = false;
  }

  get LForm() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService
      .login$(this.LForm.email.value, this.LForm.password.value)
      .pipe(first())
      .subscribe(
        success => {
          if (success) {
            this.alertService.success('Login successful', true);
            this.router.navigate(['/']);
          }
        },
        error => {
          console.log(error);
          this.alertService.error(error);
          this.loading = false;
        }
      );
  }
}
