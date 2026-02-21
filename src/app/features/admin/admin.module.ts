import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin_routing-module';

// Standalone components
import { AdminComponent } from './admin.component';
import { LoginComponent } from './login/login.component';
import { AddUserComponent } from './add-user/add-user.component';
import { UserTableComponent } from './user-table/user-table.component';
import { AddSalaryComponent } from './add-salary/add-salary.component'; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,

    // ✅ Standalone components go here
    AdminComponent,
    LoginComponent,
    UserTableComponent,
    AddUserComponent,
    AddSalaryComponent
  
  ]
})
export class AdminModule {}
