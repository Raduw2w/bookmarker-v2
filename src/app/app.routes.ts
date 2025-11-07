import { Routes } from '@angular/router';
import { BookmarkListComponent } from './features/bookmark-list/bookmark-list.component';

export const routes: Routes = [
  { path: '', component: BookmarkListComponent },
  {
    path: 'create',
    loadComponent: () =>
      import('./features/bookmark-create/bookmark-create.component')
        .then(m => m.BookmarkCreateComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./features/bookmark-edit/bookmark-edit.component')
        .then(m => m.BookmarkEditComponent)
  },
  { path: '**', redirectTo: '' }
];
