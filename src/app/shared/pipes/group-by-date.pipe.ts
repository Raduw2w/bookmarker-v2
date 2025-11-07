import { Pipe, PipeTransform } from '@angular/core';
import { Bookmark } from '../../core/models/bookmark.model';

export type DateGroups = { today: Bookmark[]; yesterday: Bookmark[]; older: Bookmark[] };

@Pipe({
  name: 'groupByDate',
  standalone: true,
  pure: true, // ✅ recompute only when input reference changes
})
export class GroupByDatePipe implements PipeTransform {
  transform(list: Bookmark[] | null | undefined): DateGroups {
    const items = list ?? [];
    const today = atMidnight(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const out: DateGroups = { today: [], yesterday: [], older: [] };
    for (const b of items) {
      const d = atMidnight(new Date(String(b.createdAt)));
      if (sameDay(d, today)) out.today.push(b);
      else if (sameDay(d, yesterday)) out.yesterday.push(b);
      else out.older.push(b);
    }
    return out;
  }
}

function atMidnight(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}
