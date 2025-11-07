// import { ApplicationConfig } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { routes } from './app.routes';
// import { provideHttpClient } from '@angular/common/http';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideRouter(routes),
//     provideHttpClient()
//   ],
// };

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { bookmarksReducer } from './core/state/bookmarks/bookmarks.reducer';
import { BookmarksEffects } from './core/state/bookmarks/bookmarks.effects';
import { provideHttpClient } from '@angular/common/http';

export const appConfig = {
  providers: [
    provideHttpClient(),
    provideStore({ bookmarks: bookmarksReducer }),
    provideEffects([BookmarksEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: false }),
  ],
};
