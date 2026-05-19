import { Component } from '@angular/core';


import { RouterOutlet } from '@angular/router';
<<<<<<< Updated upstream
import { Header } from '../header/header'; 
import { Footer } from '../footer/footer';
import {Sidebar} from '../sidebar/sidebar';



@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Footer, Sidebar],
=======
import { Sidebar } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, HeaderComponent],
>>>>>>> Stashed changes
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
