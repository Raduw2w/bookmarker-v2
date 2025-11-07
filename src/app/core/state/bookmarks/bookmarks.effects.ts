import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BookmarksActions } from './bookmarks.actions';
import { BookmarkService } from '../../services/bookmark.service';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';

@Injectable()
export class BookmarksEffects {
  private actions$ = inject(Actions);
  private api = inject(BookmarkService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.load),
      switchMap(() =>
        this.api.list().pipe(
          map(bookmarks => BookmarksActions.loadSuccess({ bookmarks })),
          catchError(err => of(BookmarksActions.loadFailure({ error: err?.message ?? 'Load failed' })))
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.create),
      mergeMap(({ payload }) =>
        this.api.create(payload).pipe(
          map(bookmark => BookmarksActions.createSuccess({ bookmark })),
          catchError(err => of(BookmarksActions.createFailure({ error: err?.message ?? 'Create failed' })))
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.update),
      mergeMap(({ bookmark }) =>
        this.api.update(bookmark).pipe(
          map(b => BookmarksActions.updateSuccess({ bookmark: b })),
          catchError(err => of(BookmarksActions.updateFailure({ error: err?.message ?? 'Update failed' })))
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.delete),
      mergeMap(({ id }) =>
        this.api.delete(id).pipe(
          map(() => BookmarksActions.deleteSuccess({ id })),
          catchError(err => of(BookmarksActions.deleteFailure({ error: err?.message ?? 'Delete failed' })))
        )
      )
    )
  );
}
