import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Auth } from '@angular/fire/auth';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private auth = inject(Auth);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.auth.currentUser?.getIdToken() ?? Promise.resolve(null)).pipe(
      mergeMap(token => {
        if (token) {
          const cloned = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`),
          });
          return next.handle(cloned);
        }
        return next.handle(req);
      })
    );
  }
}
