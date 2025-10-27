import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;
  devices: MediaDeviceInfo[] = [];
  selectedDeviceId: string = '';
  stream: MediaStream | null = null;
  cameraActive = false;

  async ngOnInit() {
    try {
      // Solicitar permiso inmediatamente para listar las cámaras
      await navigator.mediaDevices.getUserMedia({ video: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter(device => device.kind === 'videoinput');

      // Selecciona la cámara integrada (normalmente la primera)
      if (this.devices.length > 0) {
        const integratedCamera = this.devices.find(d =>
          d.label.toLowerCase().includes('integrada') ||
          d.label.toLowerCase().includes('built-in') ||
          d.label.toLowerCase().includes('default')
        );

        this.selectedDeviceId = integratedCamera
          ? integratedCamera.deviceId
          : this.devices[0].deviceId;

        console.log('📸 Cámara seleccionada:', integratedCamera?.label || this.devices[0].label);
      } else {
        console.warn('No se detectaron cámaras disponibles.');
      }
    } catch (error) {
      console.error('Error al listar cámaras:', error);
      alert('No se pudo acceder a la cámara. Asegúrate de permitir el acceso en tu navegador.');
    }
  }

  async startCamera() {
    try {
      if (!this.selectedDeviceId) {
        console.warn('No hay cámara seleccionada.');
        return;
      }

      this.stopCamera();

      const constraints = {
        video: { deviceId: { exact: this.selectedDeviceId } },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.stream = stream;

      const videoElement = this.video.nativeElement;
      videoElement.srcObject = stream;

      videoElement.onloadedmetadata = async () => {
        await videoElement.play();
        this.cameraActive = true;
        console.log('✅ Cámara iniciada correctamente.');
      };
    } catch (error) {
      console.error('❌ Error al iniciar la cámara:', error);
      alert('No se pudo activar la cámara. Verifica los permisos.');
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.cameraActive = false;
      console.log('🛑 Cámara detenida.');
    }
  }

  async onDeviceChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedDeviceId = select.value;
    if (this.cameraActive) {
      await this.startCamera();
    }
  }
}
