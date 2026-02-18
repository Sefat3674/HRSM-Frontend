import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserComponent } from './user.component';
import { UserRoutingModule } from './user-routing.module.ts';
import { RouterModule } from '@angular/router';
import { AttendanceTableComponent } from './attendance-table/attendance-table.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AttendanceCalendarComponent } from './attendance-calendar/attendance-calendar.component';  

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    UserRoutingModule,
    UserComponent,
    AttendanceTableComponent,
    AttendanceCalendarComponent
    
  ]
})
export class UserModule {}