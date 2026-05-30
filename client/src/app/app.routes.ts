import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RolGuard } from './core/guards/rol.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./catalogo/components/lista-productos/lista-productos.component').then(m => m.ListaProductosComponent),
  },
  {
    path: 'catalogo/:id',
    loadComponent: () => import('./catalogo/components/detalle-producto/detalle-producto.component').then(m => m.DetalleProductoComponent),
  },
  {
    path: 'historia',
    loadComponent: () => import('./pages/historia/historia.component').then(m => m.HistoriaComponent),
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto.component').then(m => m.ContactoComponent),
  },
  {
    path: 'mi-perfil',
    loadComponent: () => import('./pages/mi-perfil/mi-perfil.component').then(m => m.MiPerfilComponent),
  },
  {
    path: 'mis-pedidos',
    loadComponent: () => import('./pages/mis-pedidos/mis-pedidos.component').then(m => m.MisPedidosComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/components/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [AuthGuard, RolGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'productos',
        loadComponent: () => import('./admin/components/gestion-productos/gestion-productos.component').then(m => m.GestionProductosComponent),
      },
      {
        path: 'inventario',
        loadComponent: () => import('./admin/components/gestion-inventario/gestion-inventario.component').then(m => m.GestionInventarioComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./admin/components/gestion-pedidos/gestion-pedidos.component').then(m => m.GestionPedidosComponent),
      },
      {
        path: 'facturacion',
        loadComponent: () => import('./admin/components/facturacion/facturacion.component').then(m => m.FacturacionComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
