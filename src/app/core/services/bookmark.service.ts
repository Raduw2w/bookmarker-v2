import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bookmark } from '../models/bookmark.model';
import { environment } from '../../../environments/environment.development';
import { catchError, map, of, switchMap, throwError } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/bookmarks`;

  list(): Observable<Bookmark[]> {
    return this.http.get<Bookmark[]>(this.base);
  }

  // src/app/core/services/bookmark.service.ts

get(id: number | string) {
  const url = `${this.base}/${id}`;
  return this.http.get<Bookmark>(url).pipe(
    catchError(err => {
      // Fallback for string IDs or odd backends: try ?id=<id>
      if (err.status === 404) {
        return this.http.get<Bookmark[]>(`${this.base}?id=${encodeURIComponent(String(id))}`).pipe(
          map(arr => {
            if (arr.length > 0) return arr[0];
            throw err;
          })
        );
      }
      return throwError(() => err);
    })
  );
}


  create(payload: Omit<Bookmark, 'id'>): Observable<Bookmark> {
    return this.http.post<Bookmark>(this.base, payload);
  }

  update(payload: Bookmark): Observable<Bookmark> {
    return this.http.put<Bookmark>(`${this.base}/${payload.id}`, payload);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
