import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

import { AuthService, AlertService, FileService } from '@app/_services';

import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/app.component';
import { AdminComponent } from '@app/admin/admin.component';
import { LoginComponent } from '@app/login/login.component';
import { HomeComponent } from '@app/home/home.component';
import { DashboardComponent } from '@app/dashboard/dashboard.component';
import { LogoutComponent } from '@app/logout/logout.component';
import { UicAlertComponent } from './_directives';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    LoginComponent,
    HomeComponent,
    DashboardComponent,
    LogoutComponent,
    UicAlertComponent,
    FileUploaderComponent
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule, RoundProgressModule],
  providers: [AuthService, AlertService],
  bootstrap: [AppComponent]
})
export class AppModule {}
