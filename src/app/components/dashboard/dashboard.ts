import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🚀 1. Importamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  isLoading = true;
  errorMessage = '';

  stats = {
    usuarios: { totales: 0, particulares: 0, empresa: 0 },
    productos: { totales: 0, activos: 0, inactivos: 0 },
    solicitudes: { totales: 0, pendientes: 0, aceptadas: 0 },
    pedidos: { totales: 0, envio: 0, recogida: 0 },
    ingresos: { totales: 20000, mes: 300, dia: 8 }
  };

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef // 2. Lo inyectamos en el constructor
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('📦 DATOS RECIBIDOS DEL BACKEND:', data); 

       // 1. USUARIOS
        this.stats.usuarios.totales = data.totalUsers || 0;
        this.stats.usuarios.particulares = data.usersByRole?.['Particulares'] || 0;
        this.stats.usuarios.empresa = data.usersByRole?.['Empresas'] || 0;

        // 2. PRODUCTOS
        this.stats.productos.totales = data.totalProducts || 0;
        this.stats.productos.activos = data.productsByStatus?.['Activos'] || data.productsByStatus?.['ACTIVE'] || 0;
        this.stats.productos.inactivos = data.productsByStatus?.['Inactivos'] || data.productsByStatus?.['INACTIVE'] || 0;

        // 3. SOLICITUDES
        this.stats.solicitudes.totales = data.totalProposals || 0;
        this.stats.solicitudes.pendientes = data.proposalsByStatus?.['Pendientes'] || data.proposalsByStatus?.['OPEN'] || 0;
        this.stats.solicitudes.aceptadas = data.proposalsByStatus?.['Aceptadas'] || data.proposalsByStatus?.['FULFILLED'] || 0;

        // 4. PEDIDOS
        this.stats.pedidos.totales = data.totalOrders || 0;
        this.stats.pedidos.envio = data.ordersByType?.['Envío'] || data.ordersByType?.['1'] || data.ordersByType?.['true'] || 0;
        this.stats.pedidos.recogida = data.ordersByType?.['Recogida'] || data.ordersByType?.['0'] || data.ordersByType?.['false'] || 0;

        // 5. INGRESOS
        this.stats.ingresos.totales = data.totalRevenue || 0;

        this.isLoading = false;

        //  3. ¡Obligamos a Angular a repintar el HTML AHORA MISMO!
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error cargando el dashboard:', err);
        this.errorMessage = 'No se pudieron cargar los datos de la base de datos.';
        this.isLoading = false;
        
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // GENERADORES DE GRÁFICOS DINÁMICOS
  // ==========================================
  
  getUsuariosPie() {
    const total = this.stats.usuarios.totales === 0 ? 1 : this.stats.usuarios.totales; 
    const perc = Math.round((this.stats.usuarios.particulares / total) * 100);
    return `conic-gradient(#bef264 0% ${perc}%, #22d3ee ${perc}% 100%)`;
  }

  getProductosPie() {
    const total = this.stats.productos.totales === 0 ? 1 : this.stats.productos.totales;
    const perc = Math.round((this.stats.productos.activos / total) * 100);
    return `conic-gradient(#6366f1 0% ${perc}%, #c084fc ${perc}% 100%)`;
  }

  getSolicitudesPie() {
    const total = this.stats.solicitudes.totales === 0 ? 1 : this.stats.solicitudes.totales;
    const perc = Math.round((this.stats.solicitudes.pendientes / total) * 100);
    return `conic-gradient(#4b5563 0% ${perc}%, #d1d5db ${perc}% 100%)`;
  }

  getPedidosPie() {
    const total = this.stats.pedidos.totales === 0 ? 1 : this.stats.pedidos.totales;
    const perc = Math.round((this.stats.pedidos.envio / total) * 100);
    return `conic-gradient(#ef4444 0% ${perc}%, #1d4ed8 ${perc}% 100%)`;
  }
}