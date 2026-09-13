export type Repartidor = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
};

// Cuenta del equipo de reparto. No se enlaza desde el ecommerce público —
// solo se accede escribiendo la URL directamente (igual que /administrativo).
export const repartidores: Repartidor[] = [
  {
    id: "rep-demo",
    name: "Repartidor Demo",
    email: "repartidor@j3sas.co",
    password: "repartidor123",
    phone: "3000000000",
  },
];

export function findRepartidorByEmail(email: string): Repartidor | undefined {
  return repartidores.find((r) => r.email.toLowerCase() === email.trim().toLowerCase());
}
