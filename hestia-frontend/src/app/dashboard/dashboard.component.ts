import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CameraComponent } from './camera/camera.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CameraComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  selectedView: string = 'home';

  constructor(private auth: AuthService, private router: Router) {}

  selectView(view: string) {
    this.selectedView = view;
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
 
}