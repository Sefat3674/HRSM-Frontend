import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { DashboardViewComponent } from './dashboardview/dashboardview.component';
import { AttendanceTableComponent } from './attendance-table/attendance-table.component';
import { AttendanceCalendarComponent } from './attendance-calendar/attendance-calendar.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [
  {
    path: '',
    component: UserComponent, // wrapper with sidebar
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardViewComponent }, // dashboard view
      { path: 'attendance/:id', component: AttendanceTableComponent },
      { path: 'attendance-calendar', component: AttendanceCalendarComponent },
      { path: 'profile', component: UserProfileComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}