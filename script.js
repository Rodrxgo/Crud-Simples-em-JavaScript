class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });
        this.displayUsers();
    }

    async saveUser() {
        const name = document.getElementById('name').value;
        const birthday = document.getElementById('birthday').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const photoFile = document.getElementById('photo').files[0];

        try {
            const photoBase64 = await this.getBase64(photoFile);

            const user = {
                id: this.currentEditId || Date.now(),
                name,
                birthday,
                phone,
                email,
                photo: photoBase64
            };

            if (this.currentEditId) {
                const index = this.users.findIndex(u => u.id === this.currentEditId);
                if (index !== -1) {
                    this.users[index] = user;
                }
                this.currentEditId = null;
            } else {
                this.users.push(user);
            }

            localStorage.setItem('users', JSON.stringify(this.users));
            this.displayUsers();
            document.getElementById('userForm').reset();
            this.showAlert('Usuário salvo com sucesso!', 'success');
        } catch (error) {
            this.showAlert('Erro ao salvar. Tente novamente!', 'danger');
        }
    }

    getBase64(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    editUser(id) {
        const user = this.users.find(u => u.id === id);
        if (user) {
            document.getElementById('name').value = user.name;
            document.getElementById('birthday').value = user.birthday;
            document.getElementById('phone').value = user.phone;
            document.getElementById('email').value = user.email;
            this.currentEditId = id;
            document.querySelector('button[type="submit"]').innerHTML = '<i class="bi bi-check-lg"></i> Atualizar Usuário';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    deleteUser(id) {
        if (confirm('Tem certeza que deseja deletar este usuário?')) {
            this.users = this.users.filter(user => user.id !== id);
            localStorage.setItem('users', JSON.stringify(this.users));
            this.displayUsers();
            this.showAlert('Usuário deletado!', 'success');
        }
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    displayUsers() {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';

        if (this.users.length === 0) {
            usersList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info" role="alert">
                        Nenhum usuário encontrado!
                    </div>
                </div>
            `;
            return;
        }

        this.users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'col-md-6 col-lg-4';
            userCard.innerHTML = `
                <div class="card user-card h-100 shadow-sm">
                    <div class="card-body text-center">
                        <img src="${user.photo}" alt="${user.name}" class="user-photo mb-3">
                        <h5 class="card-title">${user.name}</h5>
                        <div class="card-text">
                            <p class="mb-1"><i class="bi bi-calendar"></i> ${user.birthday}</p>
                            <p class="mb-1"><i class="bi bi-telephone"></i> ${user.phone}</p>
                            <p class="mb-3"><i class="bi bi-envelope"></i> ${user.email}</p>
                        </div>
                        <div class="btn-group w-100" role="group">
                            <button onclick="userManager.editUser(${user.id})" class="btn btn-outline-primary">
                                <i class="bi bi-pencil"></i> Editar
                            </button>
                            <button onclick="userManager.deleteUser(${user.id})" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i> Deletar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            usersList.appendChild(userCard);
        });
    }
}

const userManager = new UserManager();