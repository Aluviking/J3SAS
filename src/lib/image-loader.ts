"use client";

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

export default function imageLoader({ src }: ImageLoaderProps) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`;
}
