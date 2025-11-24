import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MediaPipeService {
  // La URL base del servicio de Python
  private readonly mediaPipeUrl = 'http://localhost:5000';

  constructor(private readonly httpService: HttpService) {}

  async start(): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.mediaPipeUrl}/start`),
    );
    return data;
  }

  async stop(): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.mediaPipeUrl}/stop`),
    );
    return data;
  }
}
