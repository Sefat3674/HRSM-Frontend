import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'admin/login', pathMatch: 'full' },
    {
      path: 'admin',
      loadChildren: () => import('./features/admin/admin.module')
        .then(m => m.AdminModule)
    },
    {
      path: 'user',
      loadChildren: () => import('./features/user/user.module')
        .then(m => m.UserModule)
    },

  { path: '**', redirectTo: 'admin/login', pathMatch: 'full' }
];