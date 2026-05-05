import { Role, User, db } from 'astro:db';
import { v4 as UUID } from 'uuid';
import bcrypt from 'bcryptjs';


// https://astro.build/db/seed
export default async function seed() {
 const roles = [
   { id: 'admin', name: 'Administrador' },
   { id: 'user', name: 'Usuario de sistema' },
 ];


 const jorge = {
   id: UUID(),
   name: 'jorge',
   email: 'jorgecoto.prof@uls.edu.sv',
   password: bcrypt.hashSync('123456'),
   role: 'admin',
 };


 const jorge2 = {
   id: UUID(),
   name: 'jorge coto',
   email: 'jorgealberto.cotozelaya@gmail.com',
   password: bcrypt.hashSync('123456'),
   role: 'user',
 };


 await db.insert(Role).values(roles);
 await db.insert(User).values([jorge, jorge2]);
}
