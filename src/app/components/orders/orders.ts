import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../services/orders.service';

interface OrderDetail {
  nombre: string;
  cantidad: number;
  precio: number;
  total: number;
}

interface Order {
  id: number;
  nombre: string;
  fecha: string;
  tipoEnvio: 'domicilio' | 'recogida';
  pagoTotal: number;
  estado: 'Completado' | 'Cancelado' | 'Pendiente' | 'En Proceso';
  detalles: OrderDetail[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class Orders implements OnInit {
  filtroActual: string = 'Todos';
  isLoading = true;
  pedidoSeleccionado: Order | null = null;
  pedidoACancelar: Order | null = null; 
  pedidos: Order[] = [];

  // Ordenación
  ordenActual: 'asc' | 'desc' = 'asc';

  constructor(
    private ordersService: OrdersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.isLoading = true;
    this.ordersService.getOrders().subscribe({
      next: (data) => {
        console.log('📦 Pedidos del backend:', data);
        
        this.pedidos = data.map((p: any) => ({
          id: p.id || p.orderId || 0,
          nombre: p.buyer?.firstName || 'Desconocido',
          fecha: p.createdAt || p.orderDate || 'Desconocida',
          tipoEnvio: (p.requiresShipping === true) ? 'domicilio' : 'recogida',
          pagoTotal: p.totalAmount || p.precioTotal || 0,
          estado: this.traducirEstado(p.status || p.orderStatus),
          detalles: []
        }));

        this.ordenarLista();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Traductor de estados
  traducirEstado(estadoJava: string): 'Completado' | 'Cancelado' | 'Pendiente' | 'En Proceso' {
    switch (estadoJava) {
      case 'COMPLETED': return 'Completado';
      case 'CANCELLED': return 'Cancelado';
      case 'PROCESSING': return 'En Proceso';
      case 'PENDING': default: return 'Pendiente';
    }
  }

  // Alternar orden y reordenar
  alternarOrden() {
    this.ordenActual = this.ordenActual === 'asc' ? 'desc' : 'asc';
    this.ordenarLista();
  }

  ordenarLista() {
    this.pedidos.sort((a, b) => {
      return this.ordenActual === 'asc' ? a.id - b.id : b.id - a.id;
    });
  }

  get pedidosFiltrados() {
    if (this.filtroActual === 'Todos') return this.pedidos;
    return this.pedidos.filter(p => p.estado === this.filtroActual);
  }

  cambiarFiltro(nuevoFiltro: string) {
    this.filtroActual = nuevoFiltro;
    this.pedidoSeleccionado = null; 
  }

  // Descargamos los detalles cuando abrimos el panel
  verDetalles(pedido: Order) {
    this.pedidoSeleccionado = pedido;
    
    this.ordersService.getOrderDetails(pedido.id).subscribe({
      next: (detallesData) => {
        console.log(`📦 Detalles del pedido #${pedido.id}:`, detallesData);
        
        // Mapeamos los detalles que llegan del backend (OrderDetails)
        this.pedidoSeleccionado!.detalles = detallesData.map((d: any) => ({
          nombre: d.product?.productTitle || d.product?.title || 'Producto desconocido',
          cantidad: d.quantity || 1,
          precio: d.unitPrice || d.price || 0,
          total: (d.quantity || 1) * (d.unitPrice || d.price || 0)
        }));
        
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar detalles:', err)
    });
  }

  confirmarCancelacion(pedido: Order) {
    this.pedidoACancelar = pedido;
  }

  cerrarCancelacion() {
    this.pedidoACancelar = null;
  }

  ejecutarCancelacion() {
    if (this.pedidoACancelar) {
      console.log('🛑 Cancelando pedido ID:', this.pedidoACancelar.id);
      this.ordersService.cancelOrder(this.pedidoACancelar.id).subscribe({
        next: () => {
          this.cargarPedidos(); // Se recarga la lista para actualizar el estado
          this.cerrarCancelacion();
        },
        error: (err) => console.error('Error al cancelar pedido:', err)
      });
    }
  }
}