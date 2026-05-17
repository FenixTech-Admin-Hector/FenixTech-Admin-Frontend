import { Routes } from '@angular/router';
import { adminGuard } from './services/admin.guard';

import { LoginComponent } from './components/auth/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Users } from './components/users/users';
import { Products } from './components/products/products';
import { Categories } from './components/categories/categories';
import { Proposals } from './components/proposals/proposals';
import { Orders } from './components/orders/orders';
import { Community } from './components/community/community';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  // Blindamos todas las secciones del panel con el Guard funcional
  { path: 'dashboard', component: Dashboard, canActivate: [adminGuard] },
  { path: 'usuarios', component: Users, canActivate: [adminGuard] },
  { path: 'productos', component: Products, canActivate: [adminGuard] },
  { path: 'categorias', component: Categories, canActivate: [adminGuard] },
  { path: 'solicitudes', component: Proposals, canActivate: [adminGuard] },
  { path: 'pedidos', component: Orders, canActivate: [adminGuard] },
  { path: 'comunidad', component: Community, canActivate: [adminGuard] },
  
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } 
];