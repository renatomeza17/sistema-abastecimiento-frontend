import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
<<<<<<< HEAD
=======
import { HeaderComponent } from '../header/header';
>>>>>>> 3b7b9e694748a57a990c396bd8736e2f3fa0baf2

@Component({
  selector: 'app-main-layout',
  standalone: true,
<<<<<<< HEAD
  imports: [RouterOutlet, Sidebar],
=======
  imports: [RouterOutlet, Sidebar, HeaderComponent],
>>>>>>> 3b7b9e694748a57a990c396bd8736e2f3fa0baf2
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}