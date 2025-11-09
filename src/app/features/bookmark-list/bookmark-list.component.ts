import { Component, OnInit, signal, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  Observable,
  map,
  startWith,
  shareReplay,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  tap,
} from 'rxjs';
import Fuse, { IFuseOptions } from 'fuse.js';

import { Bookmark } from '../../core/models/bookmark.model';
import { BookmarksActions } from '../../core/state/bookmarks/bookmarks.actions';
import { selectAllBookmarks, selectError } from '../../core/state/bookmarks/bookmarks.reducer';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { HighlightFusePipe } from '../../shared/pipes/highlight-fuse.pipe';
import { GroupByDatePipe } from '../../shared/pipes/group-by-date.pipe';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

// ...imports omitted for brevity (same as previous version) ...

@Component({
  selector: 'app-bookmark-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTooltipModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    SearchBarComponent,
    HighlightFusePipe,
    GroupByDatePipe,
    ErrorBannerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookmark-list.component.html',
  styleUrls: ['./bookmark-list.component.scss'],
})
export class BookmarkListComponent implements OnInit {
  openBookmark(b: Bookmark) {
    window.open(b.url, '_blank', 'noopener');
  }

  allBookmarks$!: Observable<Bookmark[]>;
  searchBookmarks$!: Observable<Bookmark[]>;
  bookmarks$!: Observable<Bookmark[]>;
  errorMsg$!: Observable<string | null>;

  search = signal<string>('');
  private search$ = toObservable(this.search);

  private matchesById = new Map<string, Array<{ key: string; indices: [number, number][] }>>();

  private readonly fuseOptions: IFuseOptions<Bookmark> = {
    includeScore: true,
    includeMatches: true,
    threshold: 0.35,
    ignoreLocation: true,
    distance: 100,
    minMatchCharLength: 2,
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'url', weight: 0.3 },
    ],
  };

  todayCollapsed = signal(false);
  yesterdayCollapsed = signal(false);
  olderCollapsed = signal(false);

  private destroyRef = inject(DestroyRef);

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.store.dispatch(BookmarksActions.load());
    this.allBookmarks$ = this.store.select(selectAllBookmarks);
    this.errorMsg$ = this.store.select(selectError);

    const fuse$ = this.allBookmarks$.pipe(
      map((list) => new Fuse<Bookmark>(list, this.fuseOptions)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    const query$ = this.search$.pipe(
      startWith(''),
      debounceTime(250),
      distinctUntilChanged()
    );

    // Auto-expand all when searching
    query$
      .pipe(
        tap((q) => {
          const hasQuery = !!(q ?? '').trim();
          if (hasQuery) this.expandAll();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

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
        const results = fuse.search(query);
        const mapMatches = new Map<string, Array<{ key: string; indices: [number, number][] }>>();
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
        return results.map((r) => r.item);
      })
    );

    this.bookmarks$ = this.searchBookmarks$;
  }

  // --- Expand / Collapse controls ---
  toggle(section: 'today' | 'yesterday' | 'older') {
    switch (section) {
      case 'today':
        this.todayCollapsed.set(!this.todayCollapsed());
        break;
      case 'yesterday':
        this.yesterdayCollapsed.set(!this.yesterdayCollapsed());
        break;
      case 'older':
        this.olderCollapsed.set(!this.olderCollapsed());
        break;
    }
  }

  expandAll() {
    this.todayCollapsed.set(false);
    this.yesterdayCollapsed.set(false);
    this.olderCollapsed.set(false);
  }

  collapseAll() {
    this.todayCollapsed.set(true);
    this.yesterdayCollapsed.set(true);
    this.olderCollapsed.set(true);
  }

  deleteBookmark(b: Bookmark) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete bookmark', message: `Delete “${b.title}”?` },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.store.dispatch(BookmarksActions.delete({ id: b.id }));
    });
  }

  onSearch(q: string) {
    this.search.set(q ?? '');
  }

  getMatchesFor(id: number | string, key: 'title' | 'url') {
    const m = this.matchesById.get(String(id)) ?? [];
    const found = m.find((x) => x.key === key);
    return found?.indices ?? null;
  }

  retry = () => this.store.dispatch(BookmarksActions.load());
}
