import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

type ConfirmVariant = 'default' | 'danger';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant; // 'default' | 'danger'
}

@Component({
  standalone: true,
  selector: 'app-confirm-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  styleUrls: ['./confirm-dialog.component.scss'],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  isDanger: boolean;

  constructor(
    public ref: MatDialogRef<ConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    this.isDanger = (data?.variant ?? 'default') === 'danger';
  }
}
