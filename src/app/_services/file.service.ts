import { Injectable } from '@angular/core';
import { Observable, from, defer } from 'rxjs';
import { UploadedFile } from '@app/_models';
import { AuthService } from '@app/_services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(public authService: AuthService) {}

  getAll$(): Observable<UploadedFile[]> {
    return defer(() =>
      from(
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.addEventListener('load', e => {
            if (xhr.status !== 200) {
              reject(xhr.responseText);
              return;
            }

            const res = JSON.parse(xhr.response);

            return resolve(res);
          });
          xhr.addEventListener('error', e => {
            reject('Request error');
            return;
          });
          xhr.addEventListener('abort', e => {
            reject('Request aborted');
            return;
          });

          xhr.open('GET', 'http://localhost:3000/api/files', true);
          xhr.setRequestHeader('X-Auth-Token', this.authService.accessToken);
          xhr.send();
        })
      )
    );
  }

  getByName$(name: string): Observable<UploadedFile> {
    const token = this.authService.accessToken;
    return defer(() =>
      from(
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.addEventListener('load', e => {
            if (xhr.status !== 200) {
              reject(xhr.responseText);
              return;
            }

            const res = JSON.parse(xhr.response);

            return resolve(res);
          });
          xhr.addEventListener('error', e => {
            reject('Request error');
            return;
          });
          xhr.addEventListener('abort', e => {
            reject('Request aborted');
            return;
          });

          xhr.open('GET', `http://localhost:3000/api/files/${name}`, true);
          xhr.setRequestHeader('X-Auth-Token', token);
          xhr.send();
        })
      )
    );
  }

  download(name: string): void {
    const token = this.authService.accessToken;

    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', e => {
      if (xhr.status !== 200) {
        console.log(xhr.responseText);
        return;
      }
      const blob = xhr.response;
      const fileName = xhr
        .getResponseHeader('Content-Disposition')
        .match(/\sfilename="([^"]+)"(\s|$)/)[1];

      this._saveBlob(blob, fileName);
    });
    xhr.addEventListener('error', e => {
      console.log('Request error');
      return;
    });
    xhr.addEventListener('abort', e => {
      console.log('Request aborted');
      return;
    });

    xhr.open('GET', `http://localhost:3000/api/files/${name}/download`, true);
    xhr.setRequestHeader('X-Auth-Token', token);
    xhr.responseType = 'blob';
    xhr.send();
  }

  private _saveBlob(blob, fileName): void {
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
  }
}
