import { Component } from '@angular/core';
import { SideBarComponent } from "../side-bar/side-bar";
import { RouterModule, Route } from '@angular/router';
import { MainHeaderComponent } from "../main-header/main-header";

@Component({
  selector: 'app-main-layout',
  imports: [SideBarComponent, MainHeaderComponent, RouterModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayout {
  
}
