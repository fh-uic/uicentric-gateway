import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UploadService } from '@app/_services';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnInit, OnDestroy {
  file: File;
  progress: number;
  isDragging: boolean;
  success: boolean;
  error: boolean;
  loading: boolean;
  subscription: Subscription;

  constructor(private uploadService: UploadService) {}

  ngOnInit() {
    this.init();

    this.subscription = this.uploadService.uploadItem$.subscribe(res => {
      if (res && Object.keys(res).length) {
        if (res.status) {
          if (res.status === 'progress') {
            this.progress = res.progress ? res.progress : 0;
          } else if (res.status === 'finished') {
            this.success = true;
            this.initDelayed();
          } else if (res.status === 'error') {
            console.log(res.error);
            this.showError();
          }
        }
      } else {
        console.log('No response data!');
        this.showError();
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  init(): void {
    this.file = null;
    this.progress = 0;
    this.isDragging = false;
    this.success = false;
    this.error = false;
    this.loading = false;
  }

  initDelayed(): void {
    setTimeout(() => {
      this.init();
    }, 2000);
  }

  onDragEnter(): void {
    if (!this.loading) {
      this.isDragging = true;
    }
  }

  onDragLeave(): void {
    if (!this.loading) {
      this.isDragging = false;
    }
  }

  onFileInputChange(e): void {
    this.init();
    this.file = e.target.files[0];
  }

  uploadFile(e): void {
    if (this.file && !this.loading) {
      this.loading = true;
      this.uploadService.uploadFile(this.file);
    }
  }

  showError(): void {
    this.error = true;
    this.initDelayed();
  }
}
