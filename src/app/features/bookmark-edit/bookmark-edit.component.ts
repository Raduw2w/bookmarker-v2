import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Store } from '@ngrx/store';
import { selectBookmarkEntities } from '../../core/state/bookmarks/bookmarks.reducer';
import { BookmarksActions } from '../../core/state/bookmarks/bookmarks.actions';
import { Bookmark } from '../../core/models/bookmark.model';
import { map, filter, take, tap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-bookmark-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './bookmark-edit.component.html',
  styleUrls: ['./bookmark-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private store = inject(Store);

  saving = signal(false);

  id!: string;         // string key (matches entity adapter)
  bookmark!: Bookmark; // current entity

  form = this.fb.group({
    title: ['', Validators.required],
    url: ['', [Validators.required, Validators.pattern('https?://.+')]],
  });

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) {
      this.router.navigateByUrl('/');
      return;
    }
    this.id = raw;

    // Load from store (and request data if deep-linked)
    this.store.select(selectBookmarkEntities).pipe(
      tap(entities => {
        if (!entities || !entities[this.id]) {
          this.store.dispatch(BookmarksActions.load());
        }
      }),
      map(entities => entities?.[this.id]),
      filter((b): b is Bookmark => !!b),
      take(1)
    ).subscribe({
      next: (b) => {
        this.bookmark = b;
        this.form.reset({ title: b.title, url: b.url }, { emitEvent: false });
      },
      error: () => this.router.navigateByUrl('/'),
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    const { title, url } = this.form.value as { title: string; url: string };

    this.store.dispatch(
      BookmarksActions.update({ id: this.id, changes: { title, url } })
    );

    // Simple optimistic nav; if you have success/failure actions,
    // consider navigating in the effect instead.
    this.router.navigateByUrl('/');
  }

  cancel(): void {
    this.router.navigateByUrl('/');
  }
}
