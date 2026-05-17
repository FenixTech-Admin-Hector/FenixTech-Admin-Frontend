import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ProductsService } from '../../services/products.service';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  empresa: string;
  categoria: string; 
  subcategoria: string;
  precio: number;
  stock: number;
  tipo: string;
  estado: 'Activo' | 'Inactivo';
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit {
  filtroActual: string = 'Todos';
  isLoading = true;
  productoAOcultar: Product | null = null;
  productoSeleccionado: Product | null = null;
  productos: Product[] = [];

  ordenActual: 'asc' | 'desc' = 'asc';

  constructor(
    private productsService: ProductsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.isLoading = true;
    this.productsService.getProducts().subscribe({
      next: (data) => {
        console.log('📦 Productos del backend:', data);

        this.productos = data.map((p: any) => ({
          id: p.productId || 0,
          nombre: p.productTitle || 'Sin nombre',
          descripcion: p.description || 'Sin descripción detallada.',
          empresa: p.company?.companyName || 'Desconocida',
          categoria: p.subcategory?.category?.name || p.subcategory?.category?.categoryName || p.subcategory?.name || 'Sin Categoría',
          subcategoria: p.subcategory?.name || 'Sin subcategoría',
          precio: p.price || 0,
          stock: p.stock || 0,
          tipo: p.listingType === 'DONATION' ? 'Donación' : 'Venta',
          estado: (p.productStatus === 'HIDDEN') ? 'Inactivo' : 'Activo'
        }));

        this.ordenarLista(); 
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  alternarOrden() {
    this.ordenActual = this.ordenActual === 'asc' ? 'desc' : 'asc';
    this.ordenarLista();
  }

  ordenarLista() {
    this.productos.sort((a, b) => {
      return this.ordenActual === 'asc' ? a.id - b.id : b.id - a.id;
    });
  }

  get productosFiltrados() {
    if (this.filtroActual === 'Todos') return this.productos;
    return this.productos.filter(product => 
      product.categoria.toLowerCase().includes(this.filtroActual.toLowerCase())
    );
  }

  cambiarFiltro(nuevoFiltro: string) {
    this.filtroActual = nuevoFiltro;
    this.productoSeleccionado = null; // Cerramos el panel si filtramos
  }

  // --- LÓGICA DE MODALES Y ESTADOS ---

  // Función para abrir el panel lateral
  verDetalle(product: Product) {
    this.productoSeleccionado = product;
  }

  confirmarOcultar(product: Product) {
    this.productoAOcultar = product;
  }

  cerrarOcultar() {
    this.productoAOcultar = null;
  }

  ejecutarOcultar() {
    if (this.productoAOcultar) {
      this.productsService.hideProduct(this.productoAOcultar.id).subscribe({
        next: () => {
          this.cargarProductos(); 
          
          // Si ocultamos el producto que estamos viendo, podríamos cerrar el panel
          if (this.productoSeleccionado?.id === this.productoAOcultar?.id) {
            this.productoSeleccionado = null;
          }

          this.cerrarOcultar();
        },
        error: (err) => console.error('Error al ocultar:', err)
      });
    }
  }

  restaurarProducto(product: Product) {
    this.productsService.unhideProduct(product.id).subscribe({
      next: () => {
        this.cargarProductos();
      },
      error: (err) => console.error('Error al restaurar:', err)
    });
  }
}