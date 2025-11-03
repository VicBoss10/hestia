import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, deleteUser } from '@angular/fire/auth';
import { Observable, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private apiUrl = 'http://localhost:3000/users';
  private http = inject(HttpClient);

  user$(): Observable<any> {
    return authState(this.auth);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string, username: string, role: string = 'user') {
    try {
      // 1. Crear usuario en Firebase
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

      // 2. Crear usuario en backend local
      await firstValueFrom(this.http.post(this.apiUrl, {
        username,
        email,
        role
      }));

      // 3. Si ambos OK, retorna el usuario
      return userCredential;
    } catch (error) {
      // Si falla el backend, elimina el usuario de Firebase si existe
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        try {
          await deleteUser(currentUser);
        } catch (e) {
          // Puede fallar si el usuario ya fue eliminado o no tiene permisos
        }
      }
      throw error;
    }
  }

  logout() {
    return signOut(this.auth);
  }
}
