import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BookmarkService } from '../../core/services/bookmark.service';
import { BookmarksActions } from '../../core/state/bookmarks/bookmarks.actions';
import { Store } from '@ngrx/store';

@Component({
  standalone: true,
  selector: 'app-bookmark-create',
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule
  ],
  templateUrl: './bookmark-create.component.html',
  styles: [`.w-full{width:100%}.actions{display:flex;gap:.75rem;justify-content:flex-end;margin-top:1rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookmarkCreateComponent {
  private api = inject(BookmarkService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private store = inject(Store);
  
    saving = signal(false);

    form = this.fb.group({
      title: ['', Validators.required],
      url: ['', [Validators.required , Validators.pattern('https?://.+')]],
    });

  // form = this.fb.group({
  //   title: ['', Validators.required],
  //   url: ['', [Validators.required, Validators.pattern('https?://.+')]],
  // });


 save() {
  if (this.form.invalid || this.saving()) return;
  this.saving.set(true);
  const { title, url } = this.form.value as { title: string; url: string };
  const createdAt = new Date().toISOString();
  this.store.dispatch(BookmarksActions.create({ payload: { title, url, createdAt } }));
  this.router.navigateByUrl('/'); // optimistic nav
}


  cancel() { this.router.navigateByUrl('/'); }
}
