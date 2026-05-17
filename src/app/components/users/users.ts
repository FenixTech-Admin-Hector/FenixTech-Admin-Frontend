import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';

interface User {
  id: number;
  nombre: string;     
  apellidos: string;  
  email: string;
  rol: 'Particular' | 'Empresa';
  imagen: string;
  estado: 'Activo' | 'Inactivo';
  fechaRegistro: string; 
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.scss' 
})
export class Users implements OnInit {
  filtroActual: string = 'Todos';
  isLoading = true;
  
  usuarioSeleccionado: User | null = null; 
  usuarioAEditar: User | null = null;      
  usuarioABorrar: User | null = null;      

  usuarios: User[] = [];

  // Variable para controlar el orden actual
  ordenActual: 'asc' | 'desc' = 'asc';

  // Función que le da la vuelta al orden y recarga la tabla
  alternarOrden() {
    this.ordenActual = this.ordenActual === 'asc' ? 'desc' : 'asc';
    this.cargarUsuarios();
  }

  constructor(
    private usersService: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

 cargarUsuarios() {
    this.isLoading = true;
    // Le pasamos el orden actual al servicio
    this.usersService.getUsers(this.ordenActual).subscribe({
      next: (data) => {
        console.log('📦 Usuarios del backend:', data);
        
        // Mapeo seguro y filtrado del ADMIN
        this.usuarios = data
          .filter((u: any) => u.role !== 'ADMIN' && u.rol !== 'ADMIN') 
          .map((u: any) => ({
            id: u.userId || 0, 
            nombre: u.firstName || u.first_name || u.nombre || 'Sin nombre',
            apellidos: u.lastName || u.last_name || u.apellidos || '',
            email: u.email,
            rol: (u.role === 'EMPRESA' || u.rol === 'EMPRESA') ? 'Empresa' : 'Particular',
            imagen: u.image || u.imagen || '...',
            estado: (u.status === 'ACTIVE' || u.active === true || u.isActive === true) ? 'Activo' : 'Inactivo',
            fechaRegistro: u.createdAt || u.created_at || u.fechaRegistro || 'Desconocida'
          }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get usuariosFiltrados() {
    if (this.filtroActual === 'Todos') return this.usuarios;
    return this.usuarios.filter(user => user.rol === this.filtroActual);
  }

  cambiarFiltro(nuevoFiltro: string) {
    this.filtroActual = nuevoFiltro;
    this.usuarioSeleccionado = null; 
  }

  verDetalle(user: User) {
    this.usuarioSeleccionado = user;
  }

  abrirEditar(user: User) {
    this.usuarioAEditar = { ...user }; 
  }
  
  cerrarEditar() {
    this.usuarioAEditar = null;
  }

  guardarEdicion(event: Event) {
    event.preventDefault(); 
    if (this.usuarioAEditar) {
      const formData = new FormData();
      formData.append('firstName', this.usuarioAEditar.nombre);
      formData.append('lastName', this.usuarioAEditar.apellidos);
      formData.append('email', this.usuarioAEditar.email);

      console.log('📝 Editando usuario ID:', this.usuarioAEditar.id);

      this.usersService.updateUser(this.usuarioAEditar.id, formData).subscribe({
        next: () => {
          this.cargarUsuarios(); 
          this.cerrarEditar();
        },
        error: (err) => console.error('Error al editar:', err)
      });
    }
  }

  confirmarBorrado(user: User) {
    this.usuarioABorrar = user;
  }

  cerrarBorrado() {
    this.usuarioABorrar = null;
  }

  ejecutarBorrado() {
    if (this.usuarioABorrar) {
      console.log('🗑️ Baneando usuario ID:', this.usuarioABorrar.id);
      this.usersService.banUser(this.usuarioABorrar.id).subscribe({
        next: () => {
          this.cargarUsuarios(); 
          this.cerrarBorrado();
          this.usuarioSeleccionado = null;
        },
        error: (err) => console.error('Error al banear:', err)
      });
    }
  }

  restaurarUsuario(user: User) {
    console.log('🔄 Restaurando usuario ID:', user.id);
    this.usersService.restoreUser(user.id).subscribe({
      next: () => {
        this.cargarUsuarios();
      },
      error: (err) => console.error('Error al restaurar:', err)
    });
  }
}