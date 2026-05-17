import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProposalsService } from '../../services/proposals.service';

interface Proposal {
  id: number;
  nombre: string;
  solicitante: string;
  email: string;
  categoria: string;
  estado: 'Pendiente' | 'Aceptada';
  fecha: string;
  descripcion: string;
}

@Component({
  selector: 'app-proposals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proposals.html',
  styleUrl: './proposals.scss'
})
export class Proposals implements OnInit {
  filtroActual: string = 'Todos';
  isLoading = true;
  propuestaSeleccionada: Proposal | null = null; 
  propuestaABorrar: Proposal | null = null; 
  solicitudes: Proposal[] = [];

  // Ordenación
  ordenActual: 'asc' | 'desc' = 'asc';

  constructor(
    private proposalsService: ProposalsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.isLoading = true;
    this.proposalsService.getProposals().subscribe({
      next: (data) => {
        console.log('📦 Solicitudes del backend:', data);
        
        // Mapeo adaptado a la estructura exacta del JSON de Solicitudes
        this.solicitudes = data.map((p: any) => ({
          id: p.proposalId || 0,
          nombre: p.title || 'Sin título',
          
          // Entramos en requester para sacar el nombre y el email
          solicitante: p.requester?.firstName || 'Desconocido',
          email: p.requester?.email || 'Sin email',
          
          // La categoría viene directa en la raíz
          categoria: p.category?.name || 'Sin categoría',
          estado: (p.status === 'OPEN') ? 'Pendiente' : 'Aceptada',
          
          // Formateamos la fecha
          fecha: p.createdAt || 'Desconocida',
          descripcion: p.description || 'Sin descripción'
        }));

        this.ordenarLista();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar solicitudes:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Alternar orden
  alternarOrden() {
    this.ordenActual = this.ordenActual === 'asc' ? 'desc' : 'asc';
    this.ordenarLista();
  }

  ordenarLista() {
    this.solicitudes.sort((a, b) => {
      return this.ordenActual === 'asc' ? a.id - b.id : b.id - a.id;
    });
  }

  get solicitudesFiltradas() {
    if (this.filtroActual === 'Todos') return this.solicitudes;
    const estadoABuscar = this.filtroActual === 'Completada' ? 'Aceptada' : 'Pendiente';
    return this.solicitudes.filter(s => s.estado === estadoABuscar);
  }

  cambiarFiltro(nuevoFiltro: string) {
    this.filtroActual = nuevoFiltro;
    this.propuestaSeleccionada = null; 
  }

  verDetalle(p: Proposal) {
    this.propuestaSeleccionada = p;
  }

  confirmarBorrado(p: Proposal) {
    this.propuestaABorrar = p;
  }

  cerrarBorrado() {
    this.propuestaABorrar = null;
  }

  ejecutarBorrado() {
    if (this.propuestaABorrar) {
      console.log('🗑️ Borrando solicitud ID:', this.propuestaABorrar.id);
      this.proposalsService.deleteProposal(this.propuestaABorrar.id).subscribe({
        next: () => {
          this.cargarSolicitudes();
          
          if (this.propuestaSeleccionada?.id === this.propuestaABorrar?.id) {
            this.propuestaSeleccionada = null;
          }
          
          this.cerrarBorrado();
        },
        error: (err) => console.error('Error al borrar:', err)
      });
    }
  }
}