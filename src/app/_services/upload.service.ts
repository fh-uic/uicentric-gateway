import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import sha256 from 'crypto-js/sha256';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private _subject: Subject<any>;
  private _file: File;
  private _sliceSize = 256; // 256
  private _sliceIndex: number;
  private _sliceTotal: number;
  private _start: number;
  private _end: number;
  private _progress: number;
  private _loading: boolean;

  constructor() {
    this._subject = new Subject<any>();
    this._init();
  }

  private _init(): void {
    this._file = null;
    this._sliceIndex = 0;
    this._sliceTotal = 0;
    this._start = 0;
    this._end = 0;
    this._progress = 0;
    this._loading = false;
  }

  private _initDelayed(): void {
    setTimeout(() => {
      this._init();
    }, 2000);
  }

  uploadFile(file: File): void {
    if (file && !this._loading) {
      this._file = file;
      this._sliceTotal = Math.ceil(this._file.size / this._sliceSize);

      this._loading = true;
      this._send();
    }
  }

  private _send(): void {
    this._end = this._start + this._sliceSize;

    if (this._file.size - this._end < 0) {
      this._end = this._file.size;
    }

    const piece = this._slice();

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      let binary = '';
      const bytes = new Uint8Array(reader.result as ArrayBuffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      const hash = sha256(binary);
      binary = undefined;

      const xhr = new XMLHttpRequest();

      xhr.addEventListener('load', e => {
        console.log('load');

        if (xhr.status !== 200) {
          this._error(xhr.responseText);
          return;
        }

        const percent = Math.ceil(((this._sliceIndex + 1) * 100) / this._sliceTotal);
        this._progress = percent >= 100 ? 100 : percent;

        if (this._end < this._file.size) {
          this._start += this._sliceSize;
          this._sliceIndex++;
          this._inProgress();
          this._send();
        } else {
          this._finished();
          this._initDelayed();
        }
      });
      xhr.addEventListener('error', e => {
        this._error('Upload error');
        return;
      });
      xhr.addEventListener('abort', e => {
        this._error('Upload aborted');
        return;
      });

      xhr.open('POST', 'http://localhost:3000/api/files', true);

      // xhr.setRequestHeader('Content-type', 'multipart/form-data');
      xhr.setRequestHeader('X-File-Name', this._file.name);
      xhr.setRequestHeader('X-File-Size', '' + this._file.size);
      xhr.setRequestHeader('X-Index', '' + this._sliceIndex);
      xhr.setRequestHeader('X-Total', '' + this._sliceTotal);
      xhr.setRequestHeader('X-Hash', hash);

      const formdata = new FormData();
      formdata.append('piece', piece);

      xhr.send(formdata);
    });
    reader.readAsArrayBuffer(piece);
  }

  private _slice(): Blob {
    const slice = this._file.slice;
    return slice.bind(this._file)(this._start, this._end);
  }

  private _inProgress() {
    this._subject.next({
      status: 'progress',
      progress: this._progress
    });
  }

  private _finished() {
    this._subject.next({
      status: 'finished'
    });
  }

  private _error(msg: string) {
    this._subject.next({ status: 'error', error: msg });
  }

  get uploadItem$(): Observable<any> {
    return this._subject.asObservable();
  }

  get progress(): number {
    return this._progress;
  }
}
