"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { 
  ShoppingBag, 
  TrendingUp, 
  Coins, 
  Plus, 
  MoreVertical,
  Edit, 
  Trash2,
  Package
} from "lucide-react";
import { toast } from "sonner";

import { useProfilo } from "@/components/profilo-provider";
import { 
  VintedCreateInput, 
  StatoVinted, 
  STATO_VINTED_LABELS 
} from "@/lib/validators";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";

import { VintedForm } from "@/components/vinted-form";

type VintedItem = VintedCreateInput & { id: number; createdAt: string; updatedAt: string };

function Badge({ children, variant = "default", className = "" }: any) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants: any = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
    success: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20",
    warning: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20",
    info: "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20",
  };
  return <div className={`${base} ${variants[variant] || variants.default} ${className}`}>{children}</div>;
}

export function VintedClient() {
  const { activeProfilo } = useProfilo();
  const [items, setItems] = useState<VintedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VintedItem | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vinted?profilo=${encodeURIComponent(activeProfilo)}`);
      if (res.ok) {
        setItems(await res.json());
      }
    } catch (e) {
      toast.error("Errore nel caricamento dell'inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeProfilo]);

  const handleDelete = async (id: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo capo?")) return;
    try {
      const res = await fetch(`/api/vinted/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Capo eliminato");
        fetchItems();
      } else throw new Error();
    } catch {
      toast.error("Errore durante l'eliminazione");
    }
  };

  // Statistiche
  const totaleCapi = items.length;
  const inVendita = items.filter(i => i.stato === "in_vendita");
  const venduti = items.filter(i => i.stato === "completato" || i.stato === "venduto" || i.stato === "spedito");

  const valorePotenzialeInVendita = inVendita.reduce((acc, curr) => acc + (curr.prezzoVendita || 0), 0);
  const costiAcquistoTotali = items.reduce((acc, curr) => acc + (curr.costoAcquisto || 0), 0);
  const ricaviEssettiviTotali = venduti.reduce((acc, curr) => acc + (curr.ricavoEffettivo || 0), 0);
  const utileVenduti = venduti.reduce((acc, curr) => acc + ((curr.ricavoEffettivo || 0) - (curr.costoAcquisto || 0)), 0);

  const getStatusBadge = (stato: StatoVinted) => {
    switch (stato) {
      case "da_fotografare": return <Badge variant="outline" className="border-dashed">Da fotografare</Badge>;
      case "in_vendita": return <Badge variant="warning">In Vendita</Badge>;
      case "venduto": return <Badge variant="info">Venduto (Da spedire)</Badge>;
      case "spedito": return <Badge variant="secondary">Spedito</Badge>;
      case "completato": return <Badge variant="success">Completato</Badge>;
      default: return <Badge variant="outline">{stato}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario Vinted</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci le tue vendite di capi d'abbigliamento ({activeProfilo})
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<button type="button" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md" />}>
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Capo
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Aggiungi all'Inventario</DialogTitle>
            </DialogHeader>
            <VintedForm 
              mode="create" 
              onSuccess={() => { setIsAddOpen(false); fetchItems(); }} 
              onCancel={() => setIsAddOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* DASHBOARD STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-background to-amber-500/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Vendita (Potenziale)</CardTitle>
            <ShoppingBag className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{valorePotenzialeInVendita.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {inVendita.length} {inVendita.length === 1 ? 'capo' : 'capi'} da vendere
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-blue-500/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ricavi Ricevuti</CardTitle>
            <Coins className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{ricaviEssettiviTotali.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Da {venduti.length} {venduti.length === 1 ? 'vendita completata' : 'vendite completate'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-emerald-500/5 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profitto Netto (Utile venduti)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${utileVenduti >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {utileVenduti >= 0 ? "+" : ""}€{utileVenduti.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ricavi effettivi meno costo acquisto
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-rose-500/5 border-rose-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spesa d'Acquisto Totale</CardTitle>
            <Package className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{costiAcquistoTotali.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Su tutti i {totaleCapi} {totaleCapi === 1 ? 'capo a bilancio' : 'capi a bilancio'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* INVENTORY TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Listino Capi ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Caricamento inventario...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex items-center justify-center flex-col">
              <ShoppingBag className="h-10 w-10 mb-4 opacity-50" />
              Nessun capo trovato per il profilo <b>{activeProfilo}</b>.<br />
              Aggiungi il tuo primo capo cliccando sul pulsante in alto.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="border-b">
                    <th className="px-4 py-3 font-medium">Capo & Marca</th>
                    <th className="px-4 py-3 font-medium">Stato</th>
                    <th className="px-4 py-3 font-medium text-right">Costo</th>
                    <th className="px-4 py-3 font-medium text-right">Valore / Vendita</th>
                    <th className="px-4 py-3 font-medium text-right">Profitto</th>
                    <th className="px-4 py-3 font-medium text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => {
                    const isSold = item.stato === "venduto" || item.stato === "spedito" || item.stato === "completato";
                    const prof = isSold ? ((item.ricavoEffettivo || 0) - (item.costoAcquisto || 0)) : 0;
                    
                    return (
                      <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            {item.titolo}
                            {item.taglia && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground">
                                {item.taglia}
                              </Badge>
                            )}
                          </div>
                          {item.marca && <div className="text-xs text-muted-foreground">{item.marca}</div>}
                          <div className="text-[10px] text-muted-foreground mt-1">
                            Ins: {format(new Date(item.dataInserimento), 'dd MMM yyyy', { locale: it })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(item.stato as StatoVinted)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-rose-500 font-medium">€{item.costoAcquisto.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isSold ? (
                            <span className="text-blue-500 font-medium" title="Ricavo Effettivo">€{(item.ricavoEffettivo || 0).toFixed(2)}</span>
                          ) : (
                            <span className="text-amber-500 font-medium" title="Prezzo venduto">€{(item.prezzoVendita || 0).toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isSold ? (
                            <span className={`font-bold ${prof >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {prof >= 0 ? '+' : ''}€{prof.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <MenuPrimitive.Root>
                            <MenuPrimitive.Trigger
                              className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer bg-transparent border-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </MenuPrimitive.Trigger>
                            <MenuPrimitive.Portal>
                              <MenuPrimitive.Positioner className="isolate z-50 outline-none" align="end" side="bottom" sideOffset={4}>
                                <MenuPrimitive.Popup className="z-50 min-w-40 origin-[var(--transform-origin)] overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                                  <p className="px-1.5 py-1 text-xs font-medium text-muted-foreground">Azioni</p>
                                  <MenuPrimitive.Item
                                    className="relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground cursor-pointer"
                                    onClick={() => setEditingItem(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifica / Aggiorna Stato
                                  </MenuPrimitive.Item>
                                  <MenuPrimitive.Item
                                    className="relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1.5 text-sm outline-hidden select-none text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Elimina
                                  </MenuPrimitive.Item>
                                </MenuPrimitive.Popup>
                              </MenuPrimitive.Positioner>
                            </MenuPrimitive.Portal>
                          </MenuPrimitive.Root>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal di modifica */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifica Capo</DialogTitle>
            </DialogHeader>
            <VintedForm 
              mode="edit" 
              initialData={editingItem}
              onSuccess={() => { setEditingItem(null); fetchItems(); }} 
              onCancel={() => setEditingItem(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
