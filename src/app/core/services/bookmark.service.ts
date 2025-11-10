import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Bookmark } from '../models/bookmark.model';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/bookmarks`;

  list(): Observable<Bookmark[]> {
    // Let the server sort; avoids sorting in effects/components
    return this.http.get<Bookmark[]>(`${this.base}?_sort=createdAt&_order=desc`);
  }

  get(id: number | string): Observable<Bookmark> {
    const url = `${this.base}/${encodeURIComponent(String(id))}`;
    return this.http.get<Bookmark>(url).pipe(
      catchError(err => {
        if (err.status === 404) {
          return this.http
            .get<Bookmark[]>(`${this.base}?id=${encodeURIComponent(String(id))}`)
            .pipe(
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

  update(payload: Partial<Bookmark> & Pick<Bookmark, 'id'>): Observable<Bookmark> {
    return this.http.patch<Bookmark>(`${this.base}/${encodeURIComponent(String(payload.id))}`, payload);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${encodeURIComponent(String(id))}`);
  }
}
