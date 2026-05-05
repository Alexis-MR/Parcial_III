/// <reference path="../.astro/db-types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference path="../.astro/actions.d.ts" />
/// <reference types="astro/client" />

interface User {
  email: string;
  name: string;
  avatar: string;
  emailVerified: boolean;
  rol: string; 
  created_at: string;
}

declare namespace App {
  interface Locals {
    isLoggedIn: boolean;
    user: User | null;
  }
}
