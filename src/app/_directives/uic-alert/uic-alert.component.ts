import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AlertService } from '@app/_services';

@Component({
  selector: 'app-uic-alert',
  templateUrl: './uic-alert.component.html',
  styleUrls: ['./uic-alert.component.scss']
})
export class UicAlertComponent implements OnInit, OnDestroy {
  private _subscription: Subscription;

  message: any;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this._subscription = this.alertService.getMessage$().subscribe(message => {
      this.message = message;
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
