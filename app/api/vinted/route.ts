import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { vintedCreateSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const profilo = searchParams.get("profilo");

    const whereClause = profilo && profilo !== "Tutti" ? { profilo } : {};

    const items = await prisma.vintedItem.findMany({
      where: whereClause,
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Internal API Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = vintedCreateSchema.safeParse(body);
    if (!result.success) {
      return new NextResponse(JSON.stringify(result.error.flatten()), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      titolo,
      marca,
      taglia,
      costoAcquisto,
      prezzoVendita,
      ricavoEffettivo,
      stato,
      dataInserimento,
      dataVendita,
      note,
      profilo,
    } = result.data;

    const profileToSave = profilo || "Principale";

    const item = await prisma.vintedItem.create({
      data: {
        titolo,
        marca: marca || null,
        taglia: taglia || null,
        costoAcquisto,
        prezzoVendita: prezzoVendita || null,
        ricavoEffettivo: ricavoEffettivo || null,
        stato,
        dataInserimento: new Date(dataInserimento),
        dataVendita: dataVendita ? new Date(dataVendita) : null,
        note: note || null,
        profilo: profileToSave,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal API Error" }, { status: 500 });
  }
}
