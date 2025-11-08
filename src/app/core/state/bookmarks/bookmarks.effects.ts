import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BookmarksActions } from './bookmarks.actions';
import { BookmarkService } from '../../services/bookmark.service';
import { catchError, delay, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class BookmarksEffects {
  private actions$ = inject(Actions);
  private api = inject(BookmarkService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  // LOAD → items
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.load),
      mergeMap(() =>
        this.api.list().pipe(
          map((items) => BookmarksActions.loadSuccess({ items })),
          catchError(() => of(BookmarksActions.loadFailure({ error: 'Failed to load bookmarks' })))
        )
      )
    )
  );

  // CREATE(data) → item
create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.create),
      mergeMap(({ data }) =>
        this.api.create(data).pipe(
          map(item => BookmarksActions.createSuccess({ item })),
          catchError(err =>
            of(BookmarksActions.createFailure({ error: err?.message ?? 'Create failed' }))
          )
        )
      )
    )
  );

  // UPDATE(id, changes) → item
  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.update),
      mergeMap(({ id, changes }) =>
        this.api.update({ id, ...changes }).pipe(
          map((item) => BookmarksActions.updateSuccess({ item })),
          catchError((err) =>
            of(BookmarksActions.updateFailure({ error: err?.message ?? 'Update failed' }))
          )
        )
      )
    )
  );

  // DELETE(id) → success(id)
  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.delete),
      mergeMap(({ id }) =>
        this.api.delete(id).pipe(
          map(() => BookmarksActions.deleteSuccess({ id })),
          catchError((err) =>
            of(BookmarksActions.deleteFailure({ error: err?.message ?? 'Delete failed' }))
          )
        )
      )
    )
  );

  // show snackbar on successful delete
  deleteSuccessToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BookmarksActions.deleteSuccess),
        tap(() => this.snack.open('Bookmark deleted', undefined, { duration: 2000 }))
      ),
    { dispatch: false }
  );

  createSuccessNavigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BookmarksActions.createSuccess),
        tap(() => this.snack.open('Bookmark created', undefined, { duration: 2000 })),
        delay(1000),
        tap(() => {
          this.router.navigateByUrl('/');
        })
      ),
    { dispatch: false }
  );

  createFailureToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BookmarksActions.createFailure),
        tap(({ error }) => {
          this.snack.open(error || 'Create failed', undefined, { duration: 2500 });
        })
      ),
    { dispatch: false }
  );
}
