import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnDestroy {
  isStreaming = false;
  // URL del endpoint de streaming del servicio de Python
  private readonly streamUrl = 'http://localhost:5000/';
  // URL del backend de NestJS
  private readonly apiUrl = 'http://localhost:3000/media-pipe';
  
  videoStreamUrl: SafeUrl;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {
    // Inicialmente, la URL apunta al stream. El backend de Python
    // enviará una imagen negra si el stream no está activo.
    this.videoStreamUrl = this.sanitizer.bypassSecurityTrustUrl(this.streamUrl);
  }

  startStreaming(): void {
    // Llama al backend de NestJS para que este inicie el servicio de Python
    this.http.post(`${this.apiUrl}/start`, {}).subscribe({
      next: () => {
        this.isStreaming = true;
        console.log('✅ Detección de gestos iniciada.');
        // Forzamos la recarga de la imagen para asegurar que el stream se actualice
        this.reloadStream();
      },
      error: (err) => console.error('❌ Error al iniciar la detección:', err)
    });
  }

  stopStreaming(): void {
    // Llama al backend de NestJS para detener el servicio
    this.http.post(`${this.apiUrl}/stop`, {}).subscribe({
      next: () => {
        this.isStreaming = false;
        console.log('🛑 Detección de gestos detenida.');
      },
      error: (err) => console.error('❌ Error al detener la detección:', err)
    });
  }

  private reloadStream(): void {
    // Truco para evitar la caché del navegador añadiendo un timestamp
    const newUrl = `${this.streamUrl}?t=${new Date().getTime()}`;
    this.videoStreamUrl = this.sanitizer.bypassSecurityTrustUrl(newUrl);
  }

  ngOnDestroy(): void {
    // Buena práctica: si el componente se destruye, detenemos el streaming
    if (this.isStreaming) {
      this.stopStreaming();
    }
  }
}
