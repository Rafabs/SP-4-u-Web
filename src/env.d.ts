/// <reference types="astro/client" />
declare module '*.css';
declare global {
  interface Window {
    __BASE_URL__?: string;
  }
}

export {};
