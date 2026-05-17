import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../../services/community.service';

interface Comment {
  id: number;
  autor: string;
  body: string;
  fecha: string;
}

interface Post {
  id: number;
  autor: string;
  titulo: string;
  fechaCorta: string;
  fechaLarga: string;
  imagen: string;
  numComentarios: number;
  contenido: string;
  comentarios: Comment[];
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community.html',
  styleUrl: './community.scss'
})
export class Community implements OnInit {
  filtroActual: string = 'ID';
  postSeleccionado: Post | null = null;
  postABorrar: Post | null = null;
  comentarioABorrar: { post: Post, comment: Comment } | null = null;
  mostrarRespuestas: boolean = false; 

  posts: Post[] = [];

  constructor(
    private communityService: CommunityService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPosts();
  }

  cargarPosts() {
    this.communityService.getPosts().subscribe({
      next: (data) => {
        console.log('📦 Posts del backend:', data);
        
        this.posts = data.map((p: any) => {
          const fechaObj = p.createdAt ? new Date(p.createdAt) : new Date();
          
          return {
            id: p.id || p.postId || 0,
            autor: p.author?.firstName || p.author?.username || 'Anónimo', 
            titulo: p.title || 'Sin título',
            fechaCorta: fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            fechaLarga: fechaObj.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) + 'h.',
            imagen: p.imageUrl || p.image || '--',
            numComentarios: p.comments?.length || p.commentCount || 0, 
            contenido: p.content || p.body || 'Sin contenido',
            comentarios: [] 
          };
        });

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando posts:', err)
    });
  }

  get postsOrdenados() {
    let resultado = [...this.posts];
    if (this.filtroActual === 'Autor asc') {
      resultado.sort((a, b) => a.autor.localeCompare(b.autor));
    } else if (this.filtroActual === 'Autor desc') {
      resultado.sort((a, b) => b.autor.localeCompare(a.autor));
    } else if (this.filtroActual === 'Fecha asc' || this.filtroActual === 'Fecha desc') {
      resultado.sort((a, b) => {
        const parseDate = (s: string) => {
          const [d, m, y] = s.split('/');
          return new Date(+y, +m - 1, +d).getTime();
        };
        return this.filtroActual === 'Fecha asc' ? parseDate(a.fechaCorta) - parseDate(b.fechaCorta) : parseDate(b.fechaCorta) - parseDate(a.fechaCorta);
      });
    } else if (this.filtroActual === 'ID desc') {
      // Lógica para ID descendente
      resultado.sort((a, b) => b.id - a.id);
    } else {
      // Por defecto o si es 'ID' o 'ID asc'
      resultado.sort((a, b) => a.id - b.id);
    }
    return resultado;
  }

  cambiarFiltro(nuevo: string) { this.filtroActual = nuevo; }

  // Ordenar por ID Asc o Desc
  alternarOrden() {
    if (this.filtroActual === 'ID' || this.filtroActual === 'ID asc') {
      this.filtroActual = 'ID desc';
    } else {
      this.filtroActual = 'ID asc';
    }
  }

  // Mostrar Comentarios
  verDetalles(post: Post) {
    this.postSeleccionado = post;
    this.mostrarRespuestas = false; 

    this.communityService.getComments(post.id).subscribe({
      next: (pageData) => {
        console.log(`💬 Comentarios del post #${post.id}:`, pageData);
        
       
        const arrayComentarios = pageData.content || pageData || [];

        this.postSeleccionado!.comentarios = arrayComentarios.map((c: any) => {
          const d = c.createdAt ? new Date(c.createdAt) : new Date();
          return {
            id: c.id || c.commentId || 0,
            autor: c.author?.firstName || c.author?.username || 'Anónimo',
            body: c.content || c.body || 'Sin texto',
            fecha: d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) + 'h'
          };
        });

        // Actualizamos el contador real de comentarios
        this.postSeleccionado!.numComentarios = this.postSeleccionado!.comentarios.length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando comentarios:', err)
    });
  }

  // --- LÓGICA DE BORRADO DE POSTS ---
  confirmarBorrado(post: Post) { this.postABorrar = post; }
  cerrarBorrado() { this.postABorrar = null; }

  ejecutarBorrado() {
    if (this.postABorrar) {
      console.log('🗑️ Borrando post ID:', this.postABorrar.id);
      this.communityService.deletePost(this.postABorrar.id).subscribe({
        next: () => {
          this.cargarPosts();
          if (this.postSeleccionado?.id === this.postABorrar?.id) {
            this.postSeleccionado = null;
          }
          this.cerrarBorrado();
        },
        error: (err) => console.error('Error borrando post:', err)
      });
    }
  }

  // --- LÓGICA DE BORRADO DE COMENTARIOS ---
  confirmarBorradoComentario(post: Post, comment: Comment) {
    this.comentarioABorrar = { post, comment };
  }
  cerrarBorradoComentario() { this.comentarioABorrar = null; }

  ejecutarBorradoComentario() {
    if (this.comentarioABorrar) {
      const { post, comment } = this.comentarioABorrar;
      console.log('🗑️ Borrando comentario ID:', comment.id);
      
      this.communityService.deleteComment(comment.id).subscribe({
        next: () => {
          // Recargamos silenciosamente los comentarios para ese post
          this.verDetalles(post);
          this.mostrarRespuestas = true; // Para que se quede desplegado al recargar
          this.cerrarBorradoComentario();
        },
        error: (err) => console.error('Error borrando comentario:', err)
      });
    }
  }
}