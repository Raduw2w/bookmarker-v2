import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { BookmarksActions } from './bookmarks.actions';
import { Bookmark } from '../../models/bookmark.model';

export interface BookmarksState extends EntityState<Bookmark> {
  loading: boolean;
  error: string | null;
}

export const adapter = createEntityAdapter<Bookmark>({
  // 🔑 normalize IDs to string for the store
  selectId: (b) => String(b.id),
  // newest first by ISO string
  sortComparer: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
});

const initialState: BookmarksState = adapter.getInitialState({
  loading: false,
  error: null,
});

export const bookmarksFeature = createFeature({
  name: 'bookmarks',
  reducer: createReducer(
    initialState,

    on(BookmarksActions.load, (state) => ({ ...state, loading: true, error: null })),
    on(BookmarksActions.loadSuccess, (state, { bookmarks }) =>
      adapter.setAll(bookmarks, { ...state, loading: false })
    ),
    on(BookmarksActions.loadFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(BookmarksActions.create, (state) => ({ ...state, loading: true })),
    on(BookmarksActions.createSuccess, (state, { bookmark }) =>
      adapter.addOne(bookmark, { ...state, loading: false })
    ),
    on(BookmarksActions.createFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(BookmarksActions.update, (state) => ({ ...state, loading: true })),
    on(BookmarksActions.updateSuccess, (state, { bookmark }) =>
      adapter.upsertOne(bookmark, { ...state, loading: false })
    ),
    on(BookmarksActions.updateFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(BookmarksActions.delete, (state) => ({ ...state, loading: true })),
    on(BookmarksActions.deleteSuccess, (state, { id }) =>
      // 🔑 make sure we remove by the normalized string id
      adapter.removeOne(String(id), { ...state, loading: false })
    ),
    on(BookmarksActions.deleteFailure, (state, { error }) => ({ ...state, loading: false, error })),
  ),
});

export const {
  name: bookmarksFeatureKey,
  reducer: bookmarksReducer,
  selectBookmarksState,
} = bookmarksFeature;

const selectors = adapter.getSelectors(selectBookmarksState);
export const { selectAll: selectAllBookmarks, selectEntities: selectBookmarkEntities } = selectors;

export const selectLoading = createSelector(
  selectBookmarksState,
  (s) => s.loading
);

export const selectError = createSelector(
  selectBookmarksState,
  (s) => s.error
);
