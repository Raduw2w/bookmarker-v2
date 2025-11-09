import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BookmarksActions } from './bookmarks.actions';
import { BookmarkService } from '../../services/bookmark.service';
import { catchError, map, of, tap, delay, exhaustMap, concatMap } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class BookmarksEffects {
  private actions$ = inject(Actions);
  private api = inject(BookmarkService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  /** LOAD → items */
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.load),
      exhaustMap(() =>
        this.api.list().pipe(
          map(items => BookmarksActions.loadSuccess({ items })),
          catchError(() => of(BookmarksActions.loadFailure({ error: 'Failed to load bookmarks. Hint: Start JSON-Server' })))
        )
      )
    )
  );

  /** CREATE → item */
  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.create),
      exhaustMap(({ data }) =>
        this.api.create(data).pipe(
          map(item => BookmarksActions.createSuccess({ item })),
          catchError(err =>
            of(BookmarksActions.createFailure({ error: err?.message ?? 'Create failed' }))
          )
        )
      )
    )
  );

  /** UPDATE → item */
  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.update),
      concatMap(({ id, changes }) =>
        this.api.update({ id, ...changes }).pipe(
          map(item => BookmarksActions.updateSuccess({ item })),
          catchError(err =>
            of(BookmarksActions.updateFailure({ error: err?.message ?? 'Update failed' }))
          )
        )
      )
    )
  );

  /** DELETE → success */
  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.delete),
      concatMap(({ id }) =>
        this.api.delete(id).pipe(
          map(() => BookmarksActions.deleteSuccess({ id })),
          catchError(err =>
            of(BookmarksActions.deleteFailure({ error: err?.message ?? 'Delete failed' }))
          )
        )
      )
    )
  );

  /** --- UX / Feedback Effects --- */

  // ✅ Toast for successful update
  updateSuccessToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BookmarksActions.updateSuccess),
        tap(() => this.snack.open('Bookmark updated', undefined, { duration: 2000 }))
      ),
    { dispatch: false }
  );

  // ✅ Navigate back after successful update
  updateSuccessNavigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BookmarksActions.updateSuccess),
        tap(() => this.router.navigateByUrl('/'))
      ),
    { dispatch: false }
  );

  // Toast for delete success
 // Toast for delete success
deleteSuccessToast$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(BookmarksActions.deleteSuccess),
      tap(() =>
        this.snack.open('Bookmark deleted', undefined, {
          duration: 3000,
          panelClass: ['snack-error'] // 👈 custom class
        })
      )
    ),
  { dispatch: false }
);


  // Create success toast + navigate
// Create success toast + navigate
createSuccessNavigate$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(BookmarksActions.createSuccess),
      tap(() =>
        this.snack.open('Bookmark created', undefined, {
          duration: 3000,
          panelClass: ['snack-success'] // ✅ green success style
        })
      ),
      tap(() => this.router.navigateByUrl('/'))
    ),
  { dispatch: false }
);


  // Create failure toast
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

  // Optional: toast for load failure
  loadFailureToast$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BookmarksActions.loadFailure),
        tap(({ error }) => this.snack.open(error, undefined, { duration: 2500 }))
      ),
    { dispatch: false }
  );
}
