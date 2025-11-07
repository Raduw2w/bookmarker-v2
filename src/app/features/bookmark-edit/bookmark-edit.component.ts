import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BookmarkService } from '../../core/services/bookmark.service';
import { Bookmark } from '../../core/models/bookmark.model';
import { switchMap } from 'rxjs';

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
  styles: [
    `
      .w-full {
        width: 100%;
      }
      .actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        margin-top: 1rem;
      }
    `,
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookmarkEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(BookmarkService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef); // 👈 add this

  saving = signal(false);
  bookmark!: Bookmark;

  form = this.fb.group({
    title: ['', Validators.required],
    url: ['', [Validators.required, Validators.pattern('https?://.+')]],
  });

  ngOnInit() {
    // inside ngOnInit of BookmarkEditComponent
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const raw = params.get('id');
          if (!raw) throw new Error('Missing id');
          const n = Number(raw);
          const id: number | string = Number.isFinite(n) ? n : raw;
          console.log('[Edit] loading id:', id); // TEMP
          return this.api.get(id);
        })
      )
      .subscribe({
        next: (b) => {
          this.bookmark = b;
          this.form.patchValue({ title: b.title, url: b.url }, { emitEvent: false });
        },
        error: (err) => {
          console.error('[Edit] failed to load:', err);
          this.router.navigateByUrl('/'); // optional
        },
      });
  }

  save() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    const updated: Bookmark = {
      ...this.bookmark,
      ...(this.form.value as { title: string; url: string }),
    };
    this.api.update(updated).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => this.saving.set(false),
    });
  }

  cancel() {
    this.router.navigateByUrl('/');
  }
}
