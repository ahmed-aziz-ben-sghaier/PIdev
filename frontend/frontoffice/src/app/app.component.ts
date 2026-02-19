import { Component, signal } from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  constructor(private router: Router) {}

  showHeaderFooter(): boolean {
    // Hide header/footer for login and register routes
    const hideOn = ['/login', '/register'];
    return !hideOn.includes(this.router.url);
  }
}
