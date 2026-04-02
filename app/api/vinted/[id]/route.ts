import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { vintedUpdateSchema } from "@/lib/validators";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = vintedUpdateSchema.safeParse(body);
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: result.error.flatten() }), {
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

    const updatedItem = await prisma.vintedItem.update({
      where: { id: parseInt(id) },
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
        profilo: profilo || "Principale",
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: "Internal API Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.vintedItem.delete({
      where: { id: parseInt(id) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Internal API Error" }, { status: 500 });
  }
}
