import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, UpdateUserDto, CreateUserDto } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  users: User[] = [];
  currentUser: any = null;
  editingUser: User | null = null;
  showEditModal = false;
  showCreateModal = false;
  showDeleteModal = false;
  userToDelete: User | null = null;
  loading = false;
  error = '';

  // Edit form fields
  editForm = {
    username: '',
    email: '',
    role: ''
  };

  // Create form fields
  createForm = {
    username: '',
    email: '',
    role: 'user'
  };

  ngOnInit() {
    this.loadCurrentUser();
    this.loadUsers();
  }

  loadCurrentUser() {
    this.authService.user$().subscribe((user: any) => {
      this.currentUser = user;
    });
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar usuarios: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  openCreateModal() {
    this.createForm = {
      username: '',
      email: '',
      role: 'user'
    };
    this.showCreateModal = true;
    this.error = '';
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.error = '';
  }

  createUser() {
    this.loading = true;
    this.error = '';

    const createData: CreateUserDto = {
      username: this.createForm.username,
      email: this.createForm.email,
      role: this.createForm.role
    };

    this.userService.createUser(createData).subscribe({
      next: (newUser: User) => {
        this.users.push(newUser);
        this.closeCreateModal();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al crear usuario: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  openEditModal(user: User) {
    this.editingUser = user;
    this.editForm = {
      username: user.username,
      email: user.email,
      role: user.role
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingUser = null;
    this.error = '';
  }

  saveUser() {
    if (!this.editingUser) return;

    this.loading = true;
    this.error = '';

    const updateData: UpdateUserDto = {
      username: this.editForm.username,
      email: this.editForm.email,
      role: this.editForm.role
    };

    this.userService.updateUser(this.editingUser.id, updateData).subscribe({
      next: (updatedUser: User) => {
        // Update the user in the list
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.closeEditModal();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al actualizar usuario: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  openDeleteModal(user: User) {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.userToDelete = null;
    this.error = '';
  }

  confirmDelete() {
    if (!this.userToDelete) return;

    this.loading = true;
    this.error = '';

    this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        // Remove user from the list
        this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
        this.closeDeleteModal();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al eliminar usuario: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'badge-admin';
      case 'user':
        return 'badge-user';
      default:
        return 'badge-default';
    }
  }
}
