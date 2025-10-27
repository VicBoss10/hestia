import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

// Importa el archivo de credenciales usando require para máxima compatibilidad
const serviceAccount = require('../hestia-f16f5-firebase-adminsdk-fbsvc-fb2a4d155b.json');

@Injectable()
export class FirebaseAdminService {
  private app: admin.app.App;

  constructor() {
    // Inicializa solo si no hay ya una app de admin (evita re-inicialización en hot reload)
    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    } else {
      this.app = admin.app();
    }
  }

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return this.app.auth().verifyIdToken(token);
  }
}
