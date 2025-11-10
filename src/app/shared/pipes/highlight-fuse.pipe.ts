import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlightFuse',
  standalone: true,
  pure: true,
})
export class HighlightFusePipe implements PipeTransform {
  private san = inject(DomSanitizer);

  transform(text: string | null | undefined, indices: [number, number][] | null): SafeHtml {
    const s = (text ?? '').toString();
    if (!indices || indices.length === 0) return s;

    // Merge overlapping ranges just in case
    const ranges = [...indices].sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];
    for (const [start, end] of ranges) {
      if (!merged.length || start > merged[merged.length - 1][1] + 1) {
        merged.push([start, end]);
      } else {
        merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end);
      }
    }

    // Escape text to prevent XSS
    const esc = (t: string) => t
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    let out = '';
    let cursor = 0;
    for (const [start, end] of merged) {
      out += esc(s.slice(cursor, start));
      out += `<mark>${esc(s.slice(start, end + 1))}</mark>`;
      cursor = end + 1;
    }
    out += esc(s.slice(cursor));

    return this.san.bypassSecurityTrustHtml(out);
  }
}
