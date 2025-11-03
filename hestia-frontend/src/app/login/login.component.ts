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
    } catch (e: any) {
      const code = e?.code || this.extractCodeFromMessage(e?.message);
      this.error = this.getAuthErrorMessage(code);
      console.error(e);
    }
    this.loading = false;
  }

  // Mensajes claros para errores de Firebase Auth
  private getAuthErrorMessage(code?: string): string {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Inténtalo más tarde.';
      case 'auth/network-request-failed':
        return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
      default:
        return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
    }
  }

  // Extrae el código "(auth/...)" desde el mensaje plano de Firebase
  private extractCodeFromMessage(message?: string): string | undefined {
    const match = /\((auth\/[^\)]+)\)/.exec(message || '');
    return match?.[1];
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
