import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, startWith, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './search-bar.component.html',
  styles: [`.full{width:100%;}`]
})
export class SearchBarComponent {
  // ✅ Explicitly name the output "search"
  @Output() search = new EventEmitter<string>();

  q = new FormControl<string>('', { nonNullable: true });

  constructor() {
    this.q.valueChanges.pipe(
      startWith(''),
      map(v => (v ?? '').trim()),
      distinctUntilChanged(),
      debounceTime(200),
    ).subscribe(v => {
      console.log('[child] emitting search:', v);   // TEMP: should print as you type
      this.search.emit(v);
    });
  }
}
