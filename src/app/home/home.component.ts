import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { UploadedFile } from '@app/_models';
import { FileService } from '@app/_services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private _unsubscribe = new Subject();
  private _listSubscription: Subscription;
  private _fileSubscription: Subscription;
  files: UploadedFile[];

  constructor(private fileService: FileService) {}

  ngOnInit() {
    this.fileService
      .getAll$()
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(
        files => {
          this.files = files;
        },
        error => {
          console.log(error);
        }
      );
  }

  ngOnDestroy() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  onClick(name: string): void {
    if (name.length) {
      this.fileService.download(name);
      // this.fileService
      //   .getByName$(name)
      //   .pipe(takeUntil(this._unsubscribe))
      //   .subscribe(
      //     res => {
      //       console.log(res);
      //     },
      //     error => {
      //       console.log(error);
      //     }
      //   );
    }
  }
}
