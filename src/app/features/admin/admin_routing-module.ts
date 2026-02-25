import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin.component';
import { AddUserComponent } from './add-user/add-user.component';
import { UserTableComponent } from './user-table/user-table.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AddSalaryComponent } from './add-salary/add-salary.component';
import { EditSalaryComponent } from './edit-salary/edit-salary.component';  
import { SalaryAdjustmentComponent } from './salary-adjustment/salary-adjustment.component';
import { PayrollComponent } from './payroll/payroll.component';


const routes: Routes = [
  // Admin login page
  { path: 'login', component: LoginComponent },

  // Admin dashboard wrapper with child routes
  {
    path: 'dashboard',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' }, // default child route
      { path: 'users', component: UserTableComponent }, 
        
    ]
  },
  { path: 'add-user', component: AddUserComponent },
  { path: 'edit-user/:id', component: EditUserComponent },
  { path: 'add-salary', component: AddSalaryComponent },
  {path: 'edit-salary/:id', component: EditSalaryComponent },
  { path: 'salary-adjustment/:id', component: SalaryAdjustmentComponent },
   {path: 'payroll',component:PayrollComponent},
  
 
    
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {} 