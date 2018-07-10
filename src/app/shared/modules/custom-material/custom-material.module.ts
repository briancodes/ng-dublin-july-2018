import { NgModule } from '@angular/core';
import { MatButtonModule, MatCheckboxModule, MatOptionModule, MatSelectModule, MatSlideToggleModule, MatToolbarModule } from '@angular/material';

@NgModule({
  imports: [
    MatButtonModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatOptionModule
  ],
  exports: [
    MatButtonModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatOptionModule
  ]
})
export class CustomMaterialModule { }
