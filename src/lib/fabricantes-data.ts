export type Fabricante = {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  password: string;
  code: string;
  productIds: string[];
};

export const fabricantes: Fabricante[] = [
  {
    id: "fab-dorado",
    businessName: "Confecciones El Dorado",
    contactName: "Andrés Gómez",
    email: "dorado@j3sas.co",
    password: "fabricante123",
    code: "DORADO10",
    productIds: [
      "brooklyn",
      "california",
      "denim",
      "exclusive",
      "dragon",
      "void",
      "looney-bugs",
      "coyote",
      "daffy",
      "mickey-cowboys",
      "mickey-wow",
      "urbn",
      "samurai",
      "yakuza",
      "eagle-crest",
      "blue-star",
      "antler-forest",
      "newspaper-type",
    ],
  },
  {
    id: "fab-andinos",
    businessName: "Textiles Andinos",
    contactName: "Laura Restrepo",
    email: "andinos@j3sas.co",
    password: "fabricante123",
    code: "ANDINOS15",
    productIds: [
      "la-23",
      "grunge-type",
      "king-crest",
      "flames",
      "brooklyn-boston",
      "cool-cats",
      "old-school-bugs",
      "orelsan-chicago",
      "street-mode",
      "brooklyn-93",
      "boston-30",
      "paris-france",
      "la-dodgers",
      "magic",
      "urban-grunge",
      "brooklyn-passion",
      "bugs-star",
      "nyc-athletic",
      "hh-monogram",
      "harry-potter",
    ],
  },
  {
    id: "fab-pacifico",
    businessName: "Pantalonetas del Pacífico",
    contactName: "Carlos Mosquera",
    email: "pacifico@j3sas.co",
    password: "fabricante123",
    code: "PACIFICO12",
    productIds: [
      "short-flame-skull",
      "short-navy-basic",
      "short-friends-dont-lie",
      "short-uptop-liberty",
      "short-bulls-23",
      "short-puerto-rico-pin",
      "short-puerto-rico-scenic",
      "short-gold-camo-star",
      "short-new-york-nh",
      "short-wave-navy",
      "short-wave-teal",
      "short-tiger-blue",
      "short-la-23",
      "short-ny-pinstripe",
      "short-negative-grunge",
      "short-ny-monogram-camo",
    ],
  },
];

export function findFabricanteByCode(code: string): Fabricante | undefined {
  const normalized = code.trim().toUpperCase();
  return fabricantes.find((f) => f.code === normalized);
}

export function findFabricanteByEmail(email: string): Fabricante | undefined {
  return fabricantes.find((f) => f.email.toLowerCase() === email.trim().toLowerCase());
}
