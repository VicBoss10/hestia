import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  username: string = '';
  error: string = '';
  loading: boolean = false;
  success: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    this.error = '';
    this.loading = true;
    try {
      await this.authService.register(this.email, this.password, this.username, 'user');
      this.success = true;
      this.loading = false;
      // Opcional: redirigir al login tras un pequeño delay
      // setTimeout(() => this.router.navigate(['/login'], { queryParams: { registered: 1 } }), 1200);
    } catch (e) {
      this.error = (e as any)?.message ?? 'Error al registrar';
      this.success = false;
      console.error(e);
    }
    this.loading = false;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
