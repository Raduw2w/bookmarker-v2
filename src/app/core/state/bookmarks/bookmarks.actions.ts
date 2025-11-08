import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Bookmark } from '../../models/bookmark.model';

export const BookmarksActions = createActionGroup({
  source: 'Bookmarks',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ items: Bookmark[] }>(),
    'Load Failure': props<{ error: string }>(),

    'Create': props<{ data: Omit<Bookmark, 'id'> }>(),
    'Create Success': props<{ item: Bookmark }>(),
    'Create Failure': props<{ error: string }>(),

    'Update': props<{ id: Bookmark['id']; changes: Partial<Bookmark> }>(),
    'Update Success': props<{ item: Bookmark }>(),
    'Update Failure': props<{ error: string }>(),

    'Delete': props<{ id: Bookmark['id'] }>(),
    'Delete Success': props<{ id: Bookmark['id'] }>(),
    'Delete Failure': props<{ error: string }>(),
  }
});
