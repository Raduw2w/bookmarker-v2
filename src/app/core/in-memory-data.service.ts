import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Bookmark } from './models/bookmark.model';

@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const now = new Date();
    const iso = (d: Date) => d.toISOString();

    const bookmarks: Bookmark[] = [
      { id: 1, title: 'Angular', url: 'https://angular.dev', createdAt: iso(now) },
      { id: 2, title: 'RxJS', url: 'https://rxjs.dev', createdAt: iso(new Date(now.getTime() - 24*60*60*1000)) }, // yesterday
      { id: 3, title: 'MDN', url: 'https://developer.mozilla.org', createdAt: iso(new Date(now.getTime() - 5*24*60*60*1000)) }, // older
    ];

    return { bookmarks };
  }

  genId(list: Bookmark[]): number {
    return list.length ? Math.max(Number(...list.map(b => b.id))) + 1 : 1;
  }
}
