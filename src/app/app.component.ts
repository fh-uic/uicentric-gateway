import { Component } from '@angular/core';
import { AuthService } from '@app/_services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'uicentric-gateway';

  constructor(public authService: AuthService) {}
}
