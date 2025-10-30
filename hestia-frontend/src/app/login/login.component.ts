import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, public router: Router) {}

  async login() {
    this.error = '';
    this.loading = true;
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (e) {
      this.error = (e as any)?.message ?? 'Error al iniciar sesión';
      console.error(e);
    }
    this.loading = false;
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
