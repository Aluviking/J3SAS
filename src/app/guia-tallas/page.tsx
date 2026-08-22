import { Ruler } from "lucide-react";
import InfoPage from "@/components/InfoPage";

const camisetas = [
  { talla: "S", pecho: "88-93", largo: "68" },
  { talla: "M", pecho: "94-99", largo: "70" },
  { talla: "L", pecho: "100-105", largo: "72" },
  { talla: "XL", pecho: "106-111", largo: "74" },
];

const pantalonetas = [
  { talla: "S", cintura: "70-75", cadera: "92-97" },
  { talla: "M", cintura: "76-81", cadera: "98-103" },
  { talla: "L", cintura: "82-88", cadera: "104-109" },
  { talla: "XL", cintura: "89-95", cadera: "110-115" },
];

const polos = [
  { talla: "S", pecho: "90-95", largo: "67" },
  { talla: "M", pecho: "96-101", largo: "69" },
  { talla: "L", pecho: "102-107", largo: "71" },
  { talla: "XL", pecho: "108-113", largo: "73" },
];

const buzos = [
  { talla: "S", pecho: "96-101", largo: "66" },
  { talla: "M", pecho: "102-107", largo: "68" },
  { talla: "L", pecho: "108-113", largo: "70" },
  { talla: "XL", pecho: "114-119", largo: "72" },
];

const ninos = [
  { talla: "4-5", pecho: "58-61", largo: "40" },
  { talla: "6-7", pecho: "62-65", largo: "44" },
  { talla: "8-9", pecho: "66-70", largo: "48" },
  { talla: "10-11", pecho: "71-75", largo: "52" },
  { talla: "12-13", pecho: "76-80", largo: "56" },
];

const camisetasOversize = [
  { talla: "S", pecho: "104-109", largo: "72" },
  { talla: "M", pecho: "110-115", largo: "74" },
  { talla: "L", pecho: "116-121", largo: "76" },
  { talla: "XL", pecho: "122-127", largo: "78" },
];

const blusasCamisas = [
  { talla: "S", pecho: "84-89", largo: "58" },
  { talla: "M", pecho: "90-95", largo: "60" },
  { talla: "L", pecho: "96-101", largo: "62" },
  { talla: "XL", pecho: "102-107", largo: "64" },
];

function Table({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: Record<string, string>[];
  columns: { key: string; label: string }[];
}) {
  return (
    <div>
      <p className="font-medium text-ink mb-2">{title}</p>
      <div className="overflow-x-auto rounded-tl-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-alt text-left">
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2 font-medium text-ink">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-border">
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-2 text-muted">
                    {row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <InfoPage title="Guía de tallas" subtitle="Medidas de referencia en centímetros." icon={Ruler}>
      <Table
        title="Camisetas"
        rows={camisetas}
        columns={[
          { key: "talla", label: "Talla" },
          { key: "pecho", label: "Contorno de pecho (cm)" },
          { key: "largo", label: "Largo (cm)" },
        ]}
      />
      <Table
        title="Polos"
        rows={polos}
        columns={[
          { key: "talla", label: "Talla" },
          { key: "pecho", label: "Contorno de pecho (cm)" },
          { key: "largo", label: "Largo (cm)" },
        ]}
      />
      <Table
        title="Buzos"
        rows={buzos}
        columns={[
          { key: "talla", label: "Talla" },
          { key: "pecho", label: "Contorno de pecho (cm)" },
          { key: "largo", label: "Largo (cm)" },
        ]}
      />
      <Table
        title="Pantalonetas"
        rows={pantalonetas}
        columns={[
          { key: "talla", label: "Talla" },
          { key: "cintura", label: "Cintura (cm)" },
          { key: "cadera", label: "Cadera (cm)" },
        ]}
      />
      <Table
        title="Niños"
        rows={ninos}
        columns={[
          { key: "talla", label: "Talla (edad)" },
          { key: "pecho", label: "Contorno de pecho (cm)" },
          { key: "largo", label: "Largo (cm)" },
        ]}
      />
      <Table
        title="Camisetas Oversize (Hombre y Dama)"
        rows={camisetasOversize}
        columns={[
          { key: "talla", label: "Talla" },
          { key: "pecho", label: "Contorno de pecho (cm)" },
          { key: "largo", label: "Largo (cm)" },
        ]}
      />
      <Table
        title="Blusas y Camisas"
        rows={blusasCamisas}
        columns={[
          { key: "talla", label: "Talla" },
          { key: "pecho", label: "Contorno de pecho (cm)" },
          { key: "largo", label: "Largo (cm)" },
        ]}
      />
      <p className="text-xs text-muted pt-2 border-t border-border">
        Si estás entre dos tallas, te recomendamos elegir la talla más grande
        para un ajuste más cómodo.
      </p>
    </InfoPage>
  );
}
