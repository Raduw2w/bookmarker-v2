import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Bookmark } from '../../models/bookmark.model';

export const BookmarksActions = createActionGroup({
  source: 'Bookmarks',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ bookmarks: Bookmark[] }>(),
    'Load Failure': props<{ error: string }>(),

    'Create': props<{ payload: Omit<Bookmark, 'id'> }>(),
    'Create Success': props<{ bookmark: Bookmark }>(),
    'Create Failure': props<{ error: string }>(),

    'Update': props<{ bookmark: Bookmark }>(),
    'Update Success': props<{ bookmark: Bookmark }>(),
    'Update Failure': props<{ error: string }>(),

    'Delete': props<{ id: number | string }>(),
    'Delete Success': props<{ id: number | string }>(),
    'Delete Failure': props<{ error: string }>(),
  }
});
