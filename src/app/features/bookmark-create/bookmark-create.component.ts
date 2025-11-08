import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { BookmarksActions } from '../../core/state/bookmarks/bookmarks.actions';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'app-bookmark-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './bookmark-create.component.html',
  styles: [`.w-full{width:100%}.actions{display:flex;gap:.75rem;justify-content:flex-end;margin-top:1rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkCreateComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private actions$ = inject(Actions);

  saving = signal(false);

  form = this.fb.group({
    title: ['', Validators.required],
    url: ['', [Validators.required, Validators.pattern('https?://.+')]],
  });

  constructor() {
    // if create fails, re-enable the button
    this.actions$
      .pipe(ofType(BookmarksActions.createFailure), takeUntilDestroyed())
      .subscribe(() => this.saving.set(false));
    // no need to handle success—effect navigates away
  }

 // unchanged except: no router.navigate here; effects handle it
save(): void {
  if (this.form.invalid || this.saving()) return;
  this.saving.set(true);
  const title = (this.form.value.title ?? '').trim();
  const url = (this.form.value.url ?? '').trim();
  const createdAt = new Date().toISOString();
  this.store.dispatch(BookmarksActions.create({ data: { title, url, createdAt } }));
}


  cancel(): void {
    // user canceled; no saving state involved
    history.length > 1 ? history.back() : location.assign('/');
  }
}
