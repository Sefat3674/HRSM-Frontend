import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { AttendanceTableComponent } from './attendance-table/attendance-table.component';  
import { AttendanceCalendarComponent } from './attendance-calendar/attendance-calendar.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: UserComponent
  },
  {
    path: 'attendance',
    component: AttendanceTableComponent
  },
  {
    path: 'attendance-calendar',
    component: AttendanceCalendarComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}