import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    // RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: 'app.html',
  styleUrls: ['app.scss'],
})
export class App {}
