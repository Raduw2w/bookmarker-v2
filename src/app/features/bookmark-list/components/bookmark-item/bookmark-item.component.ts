import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Bookmark } from '../../../../core/models/bookmark.model';

@Component({
  selector: 'app-bookmark-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bookmark-item.component.html',
  styleUrls: ['./bookmark-item.component.scss']
})
export class BookmarkItemComponent {
  @Input({ required: true }) bookmark!: Bookmark;

  getFaviconUrl(url: string): string {
    try {
      const urlObject = new URL(url);
      return `${urlObject.protocol}//${urlObject.hostname}/favicon.ico`;
    } catch {
      return '/assets/images/default-favicon.ico';
    }
  }

  truncateText(text: string, maxLength: number = 60): string {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  }
}