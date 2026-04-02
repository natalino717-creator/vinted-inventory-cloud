import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import Database from "better-sqlite3";
import path from "path";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const sqlitePath = path.join(process.cwd(), "..", "dev.db");
const db = new Database(sqlitePath);

async function migrate() {
  console.log("Reading from SQLite:", sqlitePath);
  
  const items: any[] = db.prepare("SELECT * FROM vinted_items").all();
  console.log(`Found ${items.length} items. Migrating...`);

  let count = 0;
  for (const item of items) {
    await prisma.vintedItem.upsert({
      where: { id: item.id },
      update: {
        profilo: item.profilo,
        titolo: item.titolo,
        marca: item.marca,
        taglia: item.taglia,
        costoAcquisto: item.costo_acquisto,
        prezzoVendita: item.prezzo_vendita,
        ricavoEffettivo: item.ricavo_effettivo,
        stato: item.stato,
        dataInserimento: new Date(item.data_inserimento),
        dataVendita: item.data_vendita ? new Date(item.data_vendita) : null,
        note: item.note,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      },
      create: {
        id: item.id,
        profilo: item.profilo,
        titolo: item.titolo,
        marca: item.marca,
        taglia: item.taglia,
        costoAcquisto: item.costo_acquisto,
        prezzoVendita: item.prezzo_vendita,
        ricavoEffettivo: item.ricavo_effettivo,
        stato: item.stato,
        dataInserimento: new Date(item.data_inserimento),
        dataVendita: item.data_vendita ? new Date(item.data_vendita) : null,
        note: item.note,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      },
    });
    count++;
    if (count % 10 === 0) console.log(`Migrated ${count} items...`);
  }

  console.log(`Success! Total migrated: ${count}`);
}

migrate()
  .catch(console.error)
  .finally(() => {
    db.close();
    prisma.$disconnect();
  });
