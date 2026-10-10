"use client";

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

export default function imageLoader({ src }: ImageLoaderProps) {
  // Muchos nombres de archivo del catálogo tienen espacios y comas (ej.
  // "Camiseta Hombre Oversize/coyote - ... .webp"). Sin codificar, esos
  // caracteres rompen el parseo del atributo srcset que genera next/image
  // (el navegador no puede distinguir dónde termina la URL).
  const encodedPath = src
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${encodedPath}`;
}
