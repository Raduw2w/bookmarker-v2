import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { BookmarksActions } from './bookmarks.actions';
import { Bookmark } from '../../models/bookmark.model';

export interface State extends EntityState<Bookmark> {
  loading: boolean;
  error: string | null;
}

/** Keep store sorted newest → oldest (by createdAt) */
const adapter = createEntityAdapter<Bookmark>({
  selectId: (b) => String(b.id), // supports number|string ids
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

const initialState: State = adapter.getInitialState({
  loading: false,
  error: null,
});

const featureReducer = createReducer(
  initialState,

  // LOAD
  on(BookmarksActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(BookmarksActions.loadSuccess, (state, { items }) =>
    adapter.setAll(items, { ...state, loading: false, error: null })
  ),
  on(BookmarksActions.loadFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // CREATE
  on(BookmarksActions.create, (state) => ({ ...state, error: null })),
  on(BookmarksActions.createSuccess, (state, { item }) => adapter.addOne(item, state)),
  on(BookmarksActions.createFailure, (state, { error }) => ({ ...state, error })),

  // UPDATE
  on(BookmarksActions.update, (state) => ({ ...state, error: null })),
  on(BookmarksActions.updateSuccess, (state, { item }) => adapter.upsertOne(item, state)),
  on(BookmarksActions.updateFailure, (state, { error }) => ({ ...state, error })),

  // DELETE
  on(BookmarksActions.delete, (state) => ({ ...state, error: null })),
  on(BookmarksActions.deleteSuccess, (state, { id }) => adapter.removeOne(String(id), state)),
  on(BookmarksActions.deleteFailure, (state, { error }) => ({ ...state, error }))
);

export const bookmarksFeature = createFeature({
  name: 'bookmarks', // must match provideStore({ bookmarks: ... })
  reducer: featureReducer,
});

const {
  name: BOOKMARKS_FEATURE_KEY,
  reducer: bookmarksReducer,
  selectBookmarksState,
} = bookmarksFeature;

export { BOOKMARKS_FEATURE_KEY, bookmarksReducer };

/** Entity selectors */
const entitySelectors = adapter.getSelectors();

export const selectAllBookmarks = (s: any) => entitySelectors.selectAll(selectBookmarksState(s));

export const selectBookmarkEntities = (s: any) =>
  entitySelectors.selectEntities(selectBookmarksState(s));

export const selectBookmarksLoading = (s: any) => selectBookmarksState(s).loading;

export const selectError = (s: any) => selectBookmarksState(s).error;
