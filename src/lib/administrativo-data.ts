export type AdminRole = "superadmin" | "administrador";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AdminRole;
};

// Cuentas del equipo interno de Comercializadora J3 (seguimiento
// administrativo). Ninguna de estas rutas se enlaza desde el ecommerce
// público — solo se accede escribiendo la URL directamente.
export const adminUsers: AdminUser[] = [
  {
    id: "admin-aluviking",
    name: "Aluviking",
    email: "admin@j3sas.co",
    password: "j3admin123",
    role: "superadmin",
  },
];

export function findAdminByEmail(email: string): AdminUser | undefined {
  return adminUsers.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
}
