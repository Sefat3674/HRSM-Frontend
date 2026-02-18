import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin.component';
import { AddUserComponent } from './add-user/add-user.component';
import { UserTableComponent } from './user-table/user-table.component';
import { EditUserComponent } from './edit-user/edit-user.component';

const routes: Routes = [
  // Admin login page
  { path: 'login', component: LoginComponent },

  // Admin dashboard wrapper with child routes
  {
    path: 'dashboard',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' }, // default child route
      { path: 'users', component: UserTableComponent },    // user table
       // add user page
    ]
  },
  { path: 'add-user', component: AddUserComponent },
  { path: 'edit-user/:id', component: EditUserComponent }

   
   
    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {} 