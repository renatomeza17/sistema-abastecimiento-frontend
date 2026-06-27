
import { Component, signal,inject, OnInit } from '@angular/core';
import {CommonModule,AsyncPipe} from '@angular/common';
import { RouterOutlet} from '@angular/router';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule,AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected readonly title = signal('sistema-abastecimiento-frontend');
  loadingService=inject(LoadingService)

  ngOnInit(): void {

  }

  logout(){

  }
}