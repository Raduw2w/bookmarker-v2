// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { routes } from './app.routes';
import { bookmarksReducer } from './core/state/bookmarks/bookmarks.reducer';
import { BookmarksEffects } from './core/state/bookmarks/bookmarks.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  // Material services available app-wide
  importProvidersFrom(MatDialogModule, MatSnackBarModule),

    provideStore({ bookmarks: bookmarksReducer }),
    provideEffects([BookmarksEffects]),
    isDevMode() ? provideStoreDevtools({ maxAge: 25 }) : [],
  ],
};
