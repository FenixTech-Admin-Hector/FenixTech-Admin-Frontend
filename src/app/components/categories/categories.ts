import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { CategoriesService } from '../../services/categories.service';

interface Subcategory {
  id: number;
  nombre: string;
  descripcion: string;
  estado: 'Activa' | 'Inactiva';
}

interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  estado: 'Activa' | 'Inactiva';
  subcategorias: Subcategory[];
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class Categories implements OnInit {
  filtroActual: string = 'Todos';
  categoriaSeleccionada: Category | null = null;
  isLoading = true;

  // Ordenación
  ordenActual: 'asc' | 'desc' = 'asc';

  // Estados para Modales
  mostrarCrearCat = false;
  mostrarCrearSub = false;
  nuevaCat = { nombre: '', descripcion: '' };
  nuevaSub = { nombre: '', descripcion: '' };

  categoriaAEditar: Category | null = null;
  categoriaAOcultar: Category | null = null;
  subcategoriaAEditar: Subcategory | null = null;
  subcategoriaAOcultar: Subcategory | null = null;

  listaCategorias: Category[] = [];

  constructor(
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarCategorias();
  }

  // ==========================================
  // CARGA Y FILTROS GLOBALES
  // ==========================================
  cargarCategorias() {
    this.isLoading = true;
    this.categoriesService.getCategories().subscribe({
      next: (data) => {
        console.log('📦 Categorías del backend:', data);
        this.listaCategorias = data.map((c: any) => ({
          id: c.id || c.categoryId || 0,
          nombre: c.name || c.nombre || 'Sin nombre',
          descripcion: c.description || c.descripcion || '',
          estado: (c.isActive === false || c.estado === 'Inactiva') ? 'Inactiva' : 'Activa',
          subcategorias: [] // Se cargarán dinámicamente al pulsar el Ojo
        }));
        this.ordenarLista();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando categorías:', err)
    });
  }

  alternarOrden() {
    this.ordenActual = this.ordenActual === 'asc' ? 'desc' : 'asc';
    this.ordenarLista();
  }

  ordenarLista() {
    this.listaCategorias.sort((a, b) => this.ordenActual === 'asc' ? a.id - b.id : b.id - a.id);
  }

  get categoriasFiltradas() {
    if (this.filtroActual === 'Todos') return this.listaCategorias;
    const estadoABuscar = this.filtroActual === 'Activas' ? 'Activa' : 'Inactiva';
    return this.listaCategorias.filter(c => c.estado === estadoABuscar);
  }

  cambiarFiltro(nuevoFiltro: string) {
    this.filtroActual = nuevoFiltro;
    this.categoriaSeleccionada = null;
  }

 // Cargar subcategorías aplicando el efecto memoria visual
  verSubcategorias(cat: Category) {
    this.categoriaSeleccionada = cat;
    this.categoriesService.getSubcategories(cat.id).subscribe({
      next: (subs) => {
        console.log(`📦 Subcategorías de ${cat.nombre}:`, subs);
        this.categoriaSeleccionada!.subcategorias = subs.map((s: any) => {
          
          // 1. Averiguamos el estado real que viene guardado en la Base de Datos
          const estadoRealBD = (s.isActive === false || s.estado === 'Inactiva') ? 'Inactiva' : 'Activa';
          
          return {
            id: s.id || s.subcategoryId || 0,
            nombre: s.name || s.nombre || 'Sin nombre',
            descripcion: s.description || s.descripcion || '',
            
            
            // Si la categoría madre está 'Inactiva', forzamos a que la hija se vea 'Inactiva'.
            // Si la categoría madre está 'Activa', mostramos su estado real de la BD.
            // Se consigue el efecto cascada facilmente
            estado: cat.estado === 'Inactiva' ? 'Inactiva' : estadoRealBD
          };
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando subcategorías:', err)
    });
  }

  // ==========================================
  // LÓGICA DE CATEGORÍAS (PADRES)
  // ==========================================
  abrirCrearCat() { this.mostrarCrearCat = true; }
  
  ejecutarCrearCat() {
    const payload = { name: this.nuevaCat.nombre, description: this.nuevaCat.descripcion };
    this.categoriesService.createCategory(payload).subscribe({
      next: () => {
        this.cargarCategorias();
        this.nuevaCat = { nombre: '', descripcion: '' };
        this.mostrarCrearCat = false;
      },
      error: (err) => console.error('Error al crear:', err)
    });
  }

  abrirEditarCategoria(cat: Category) { this.categoriaAEditar = { ...cat }; }
  cerrarEditarCategoria() { this.categoriaAEditar = null; }
  
  guardarEdicionCategoria(event: Event) {
    event.preventDefault();
    if (this.categoriaAEditar) {
      const payload = { name: this.categoriaAEditar.nombre, description: this.categoriaAEditar.descripcion };
      this.categoriesService.updateCategory(this.categoriaAEditar.id, payload).subscribe({
        next: () => {
          this.cargarCategorias();
          this.cerrarEditarCategoria();
        }
      });
    }
  }

  confirmarOcultarCategoria(cat: Category) { this.categoriaAOcultar = cat; }
  cerrarOcultarCategoria() { this.categoriaAOcultar = null; }
  
 ejecutarOcultarCategoria() {
    if (this.categoriaAOcultar) {
      this.categoriesService.toggleCategory(this.categoriaAOcultar.id).subscribe({
        next: () => {
          this.cargarCategorias(); // Recarga la tabla izquierda
          
    
          if (this.categoriaSeleccionada && this.categoriaSeleccionada.id === this.categoriaAOcultar?.id) {
            this.categoriaSeleccionada.estado = 'Inactiva';
            this.verSubcategorias(this.categoriaSeleccionada);
          }
          
          this.cerrarOcultarCategoria();
        }
      });
    }
  }

  restaurarCategoria(cat: Category) {
    this.categoriesService.toggleCategory(cat.id).subscribe({
      next: () => {
        this.cargarCategorias(); // Recarga la tabla izquierda
        
        
        if (this.categoriaSeleccionada && this.categoriaSeleccionada.id === cat.id) {
          this.categoriaSeleccionada.estado = 'Activa';
          this.verSubcategorias(this.categoriaSeleccionada);
        }
      }
    });
  }

  // ==========================================
  // LÓGICA DE SUBCATEGORÍAS (HIJAS)
  // ==========================================
  abrirCrearSub() { this.mostrarCrearSub = true; }

  ejecutarCrearSub() {
    if (this.categoriaSeleccionada) {
      // Enviamos el categoryId para que Spring Boot sepa de quién es hija
      const payload = { 
        name: this.nuevaSub.nombre, 
        description: this.nuevaSub.descripcion,
        categoryId: this.categoriaSeleccionada.id 
      };
      this.categoriesService.createSubcategory(payload).subscribe({
        next: () => {
          this.verSubcategorias(this.categoriaSeleccionada!); // Recarga las hijas
          this.nuevaSub = { nombre: '', descripcion: '' };
          this.mostrarCrearSub = false;
        }
      });
    }
  }

  abrirEditarSubcategoria(sub: Subcategory) { this.subcategoriaAEditar = { ...sub }; }
  cerrarEditarSubcategoria() { this.subcategoriaAEditar = null; }

  guardarEdicionSubcategoria(event: Event) {
    event.preventDefault();
    if (this.subcategoriaAEditar && this.categoriaSeleccionada) {
      const payload = { 
        name: this.subcategoriaAEditar.nombre, 
        description: this.subcategoriaAEditar.descripcion,
        categoryId: this.categoriaSeleccionada.id // Mantenemos su padre
      };
      this.categoriesService.updateSubcategory(this.subcategoriaAEditar.id, payload).subscribe({
        next: () => {
          this.verSubcategorias(this.categoriaSeleccionada!);
          this.cerrarEditarSubcategoria();
        }
      });
    }
  }

  confirmarOcultarSubcategoria(sub: Subcategory) { this.subcategoriaAOcultar = sub; }
  cerrarOcultarSubcategoria() { this.subcategoriaAOcultar = null; }

  ejecutarOcultarSubcategoria() {
    if (this.subcategoriaAOcultar) {
      this.categoriesService.toggleSubcategory(this.subcategoriaAOcultar.id).subscribe({
        next: () => {
          this.verSubcategorias(this.categoriaSeleccionada!);
          this.cerrarOcultarSubcategoria();
        }
      });
    }
  }

  restaurarSubcategoria(sub: Subcategory) {
    this.categoriesService.toggleSubcategory(sub.id).subscribe({
      next: () => this.verSubcategorias(this.categoriaSeleccionada!)
    });
  }
}