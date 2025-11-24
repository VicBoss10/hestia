import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

// Interfaces actualizadas según tu feedback
export interface Gesture {
  id: number;
  name: string;
  description: string;
}

export interface Stat {
  id: number;
  gesture_id: number; // <-- Corregido: no es un objeto anidado
  times_detected: number;
  avg_confidence: number;
  last_detected: string;
}

// Interface para los datos que vamos a mostrar en la tabla
export interface DisplayStat extends Stat {
  gestureName: string; // <-- Añadimos el nombre del gesto
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent implements OnInit {
  
  // Variables para manejar el estado
  public displayStats: DisplayStat[] = [];
  public isLoading = true;

  private statsApiUrl = 'http://localhost:3000/stats';
  private gesturesApiUrl = 'http://localhost:3000/gestures';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Usamos forkJoin para hacer ambas peticiones en paralelo
    forkJoin({
      stats: this.http.get<Stat[]>(this.statsApiUrl),
      gestures: this.http.get<Gesture[]>(this.gesturesApiUrl)
    }).subscribe(({ stats, gestures }) => {
      
      // Creamos un mapa para buscar nombres de gestos por ID fácilmente
      const gestureMap = new Map(gestures.map(g => [g.id, g.name]));

      // Combinamos los datos
      this.displayStats = stats.map(stat => ({
        ...stat,
        gestureName: gestureMap.get(stat.gesture_id) || 'Gesto Desconocido'
      }));

      this.isLoading = false; // Dejamos de cargar
    });
  }
}
