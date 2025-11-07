// import { Component, OnInit, signal, Signal, ChangeDetectionStrategy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { Bookmark } from '../../core/models/bookmark.model';

// import { MatCardModule } from '@angular/material/card';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatListModule } from '@angular/material/list';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// import {
//   Observable,
//   map,
//   startWith,
//   shareReplay,
//   combineLatest,
//   BehaviorSubject,
// } from 'rxjs';
// import { toObservable, toSignal } from '@angular/core/rxjs-interop';
// import Fuse, { IFuseOptions } from 'fuse.js';

// import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
// import { HighlightFusePipe } from '../../shared/pipes/highlight-fuse.pipe';
// import { GroupByDatePipe } from '../../shared/pipes/group-by-date.pipe';
// import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
// import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

// import { Store } from '@ngrx/store';
// import { BookmarksActions } from '../../core/state/bookmarks/bookmarks.actions';
// import { selectAllBookmarks, selectError } from '../../core/state/bookmarks/bookmarks.reducer';

// @Component({
//   selector: 'app-bookmark-list',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterModule,
//     MatCardModule,
//     MatListModule,
//     MatDividerModule,
//     MatChipsModule,
//     MatButtonModule,
//     MatIconModule,
//     MatProgressSpinnerModule,
//     MatDialogModule,
//     MatSnackBarModule,
//     SearchBarComponent,
//     HighlightFusePipe,
//     GroupByDatePipe,
//     ErrorBannerComponent,
//   ],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   templateUrl: './bookmark-list.component.html',
//   styleUrls: ['./bookmark-list.component.scss'],
// })
// export class BookmarkListComponent implements OnInit {
//   /** raw list from store (sorted desc by createdAt) */
//   allBookmarks$!: Observable<Bookmark[]>;

//   /** filtered list by current search */
//   searchBookmarks$!: Observable<Bookmark[]>;

//   /** alias so the template can keep using `bookmarks$ | async` */
//   bookmarks$!: Observable<Bookmark[]>;

//   /** signal for search text (source of truth for query) */
//   search = signal<string>('');
//   /** convert signal → observable for RxJS composition */
//   private search$ = toObservable(this.search);

//   /** store Fuse match ranges for highlight pipe */
//   private matchesById = new Map<string, Array<{ key: string; indices: [number, number][] }>>();

//   /** Error banner trigger + message */
//   private refresh$ = new BehaviorSubject<void>(undefined);
//   errorMsg: Signal<string | null>;

//   // Fuse options tuned for UX (ranked, tolerant)
//   private readonly fuseOptions: IFuseOptions<Bookmark> = {
//     includeScore: true,
//     includeMatches: true,
//     threshold: 0.35,
//     ignoreLocation: true,
//     distance: 100,
//     minMatchCharLength: 2,
//     keys: [
//       { name: 'title', weight: 0.7 },
//       { name: 'url', weight: 0.3 },
//     ],
//   };

//   constructor(
//     private store: Store,
//     private dialog: MatDialog,
//     private snack: MatSnackBar
//   ) {
//     this.errorMsg = toSignal(this.store.select(selectError), { initialValue: null });
//   }

//   ngOnInit(): void {
//     this.store.dispatch(BookmarksActions.load());

//     this.allBookmarks$ = this.store.select(selectAllBookmarks);

//     const fuse$ = this.allBookmarks$.pipe(
//       map(list => new Fuse<Bookmark>(list, this.fuseOptions)),
//       shareReplay({ bufferSize: 1, refCount: true })
//     );

//     const query$ = this.search$.pipe(startWith(''));

//     this.searchBookmarks$ = combineLatest({
//       list: this.allBookmarks$,
//       fuse: fuse$,
//       q: query$
//     }).pipe(
//       map(({ list, fuse, q }) => {
//         const query = (q ?? '').trim();
//         if (!query) { this.matchesById.clear(); return list; }

//         const results = fuse.search(query);
//         const mapMatches = new Map<string, Array<{ key: string; indices: [number, number][] }>>();

//         for (const r of results) {
//           if (r.matches?.length) {
//             mapMatches.set(
//               String(r.item.id),
//               r.matches.map(m => ({ key: String(m.key), indices: m.indices as [number, number][] }))
//             );
//           }
//         }

//         this.matchesById = mapMatches;
//         return results.map(r => r.item);
//       })
//     );

//     this.bookmarks$ = this.searchBookmarks$;
//   }

//   /** Called from <app-search-bar (search)="onSearch($event)"> */
//   onSearch(q: string) {
//     this.search.set(q ?? '');
//   }

//   /** helper for highlight pipe */
//   getMatchesFor(id: number | string, key: 'title' | 'url') {
//     const m = this.matchesById.get(String(id)) ?? [];
//     const found = m.find(x => x.key === key);
//     return found?.indices ?? null;
//   }

//   /** bound to the error banner's Retry button */
//   retry = () => {
//     this.store.dispatch(BookmarksActions.load());
//     this.refresh$.next();
//   };

//   deleteBookmark(b: Bookmark) {
//     const ref = this.dialog.open(ConfirmDialogComponent, {
//       data: { title: 'Delete bookmark', message: `Delete “${b.title}”?` }
//     });
//     ref.afterClosed().subscribe(ok => {
//       if (!ok) return;
//       this.store.dispatch(BookmarksActions.delete({ id: b.id }));
//       this.snack.open('Deleting…', undefined, { duration: 800 });
//     });
//   }
// }

import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Bookmark } from '../../core/models/bookmark.model';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BookmarkService } from '../../core/services/bookmark.service';
import {
  Observable,
  map,
  startWith,
  shareReplay,
  combineLatest,
  BehaviorSubject,
  switchMap,
  catchError,
  of,
  tap,
} from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import Fuse, { IFuseOptions } from 'fuse.js';

import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { HighlightFusePipe } from '../../shared/pipes/highlight-fuse.pipe';
import { GroupByDatePipe } from '../../shared/pipes/group-by-date.pipe';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component'; // ⬅️ add banner

@Component({
  selector: 'app-bookmark-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SearchBarComponent,
    HighlightFusePipe,
    GroupByDatePipe,
    ErrorBannerComponent, // ⬅️ add banner
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookmark-list.component.html',
  styleUrls: ['./bookmark-list.component.scss'],
})
export class BookmarkListComponent implements OnInit {
  /** raw list from API (sorted desc by createdAt) */
  allBookmarks$!: Observable<Bookmark[]>;

  /** filtered list by current search */
  searchBookmarks$!: Observable<Bookmark[]>;

  /** alias so the template can keep using `bookmarks$ | async` */
  bookmarks$!: Observable<Bookmark[]>;

  /** signal for search text (source of truth for query) */
  search = signal<string>('');
  /** convert signal → observable for RxJS composition */
  private search$ = toObservable(this.search);

  /** store Fuse match ranges for highlight pipe */
  private matchesById = new Map<string, Array<{ key: string; indices: [number, number][] }>>();

  /**Error banner  */
  private refresh$ = new BehaviorSubject<void>(undefined);
  errorMsg = signal<string | null>(null);

  // Fuse options tuned for UX (ranked, tolerant)
  private readonly fuseOptions: IFuseOptions<Bookmark> = {
    includeScore: true,
    includeMatches: true, // enable matches for highlighting
    threshold: 0.35,
    ignoreLocation: true,
    distance: 100,
    minMatchCharLength: 2,
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'url', weight: 0.3 },
    ],
  };

  constructor(private api: BookmarkService) {}

  ngOnInit(): void {
    // 1) Fetch on demand via refresh$, sort, cache; set/clear errorMsg here
    this.allBookmarks$ = this.refresh$.pipe(
      switchMap(() =>
        this.api.list().pipe(
          tap(() => this.errorMsg.set(null)),
          catchError(() => {
            this.errorMsg.set('Failed to load bookmarks.');
            return of<Bookmark[]>([]);
          })
        )
      ),
      map((list) =>
        [...list].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      ),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    // 2) Build a Fuse index whenever the list changes (also shared)
    const fuse$ = this.allBookmarks$.pipe(
      map((list) => new Fuse<Bookmark>(list, this.fuseOptions)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    // 3) Combine list + fuse + query; if empty query -> full list, else ranked results
    const query$ = this.search$.pipe(startWith(''));

    this.searchBookmarks$ = combineLatest({
      list: this.allBookmarks$,
      fuse: fuse$,
      q: query$,
    }).pipe(
      map(({ list, fuse, q }) => {
        const query = (q ?? '').trim();
        if (!query) {
          this.matchesById.clear();
          return list;
        }

        const results = fuse.search(query); // contains matches
        // rebuild the matches map
        const mapMatches = new Map<
          string,
          Array<{ key: string; indices: [number, number][] }>
        >();
        for (const r of results) {
          if (r.matches?.length) {
            mapMatches.set(
              String(r.item.id),
              r.matches.map((m) => ({
                key: String(m.key),
                indices: m.indices as [number, number][],
              }))
            );
          }
        }
        this.matchesById = mapMatches;
        return results.map((r) => r.item); // ranked
      })
    );

    // 4) Expose filtered stream to the template
    this.bookmarks$ = this.searchBookmarks$;
  }

  /** Called from <app-search-bar (search)="onSearch($event)"> */
  onSearch(q: string) {
    this.search.set(q ?? '');
  }

  /** helper for highlight pipe */
  getMatchesFor(id: number | string, key: 'title' | 'url') {
    const m = this.matchesById.get(String(id)) ?? [];
    const found = m.find((x) => x.key === key);
    return found?.indices ?? null;
  }

  /** bound to the error banner's Retry button */
  retry = () => {
    this.errorMsg.set(null);
    this.refresh$.next();
  };
}

