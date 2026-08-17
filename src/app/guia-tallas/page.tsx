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

const busos = [
  { talla: "S", pecho: "96-101", largo: "66" },
  { talla: "M", pecho: "102-107", largo: "68" },
  { talla: "L", pecho: "108-113", largo: "70" },
  { talla: "XL", pecho: "114-119", largo: "72" },
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
        title="Busos"
        rows={busos}
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
      <p className="text-xs text-muted pt-2 border-t border-border">
        Si estás entre dos tallas, te recomendamos elegir la talla más grande
        para un ajuste más cómodo.
      </p>
    </InfoPage>
  );
}
