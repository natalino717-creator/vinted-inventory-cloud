"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

import { 
  vintedCreateSchema, 
  STATI_VINTED, 
  STATO_VINTED_LABELS, 
  VintedCreateInput 
} from "@/lib/validators";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfilo } from "@/components/profilo-provider";

interface VintedFormProps {
  initialData?: VintedCreateInput & { id?: number };
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VintedForm({ initialData, mode, onSuccess, onCancel }: VintedFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { activeProfilo } = useProfilo();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VintedCreateInput>({
    resolver: zodResolver(vintedCreateSchema),
    defaultValues: initialData ?? {
      profilo: activeProfilo === "Tutti" ? "Principale" : activeProfilo,
      titolo: "",
      marca: "",
      taglia: "",
      costoAcquisto: 0,
      prezzoVendita: null,
      ricavoEffettivo: null,
      stato: "da_fotografare",
      dataInserimento: new Date().toISOString().split("T")[0],
      dataVendita: null,
      note: "",
    },
  });

  const currentStato = watch("stato");
  const currentTaglia = watch("taglia");

  async function onSubmit(data: VintedCreateInput) {
    setIsSubmitting(true);
    try {
      const url = mode === "create" ? "/api/vinted" : `/api/vinted/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Errore nella richiesta");
      }

      toast.success(
        mode === "create" ? "Capo aggiunto con successo!" : "Capo aggiornato con successo!"
      );
      
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Errore imprevisto");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Titolo */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="titolo">Nome Capo *</Label>
          <Input id="titolo" placeholder="Es. Maglia Ralph Lauren" {...register("titolo")} />
          {errors.titolo && <p className="text-xs text-destructive">{errors.titolo.message}</p>}
        </div>

        {/* Marca */}
        <div className="space-y-2">
          <Label htmlFor="marca">Marca</Label>
          <Input id="marca" list="marche" placeholder="Seleziona o scrivi la marca..." {...register("marca")} />
          <datalist id="marche">
            <option value="Polo Ralph Lauren" />
            <option value="Ralph Lauren" />
            <option value="Tommy Hilfiger" />
            <option value="Max Mara" />
            <option value="Calvin Klein" />
            <option value="Nike" />
            <option value="Adidas" />
            <option value="Lacoste" />
            <option value="Levi's" />
            <option value="The North Face" />
            <option value="Carhartt" />
            <option value="Armani" />
            <option value="Guess" />
          </datalist>
        </div>

        {/* Taglia */}
        <div className="space-y-2">
          <Label htmlFor="taglia">Taglia</Label>
          <Select
            value={currentTaglia || "none"}
            onValueChange={(val) => setValue("taglia", val === "none" ? null : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona taglia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nessuna</SelectItem>
              <SelectItem value="XS">XS</SelectItem>
              <SelectItem value="S">S</SelectItem>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="XL">XL</SelectItem>
              <SelectItem value="XXL">XXL</SelectItem>
              <SelectItem value="Unica">Unica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stato */}
        <div className="space-y-2">
          <Label htmlFor="stato">Stato</Label>
          <Select
            value={currentStato}
            onValueChange={(value) => value && setValue("stato", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona stato" />
            </SelectTrigger>
            <SelectContent>
              {STATI_VINTED.map((stato) => (
                <SelectItem key={stato} value={stato}>
                  {STATO_VINTED_LABELS[stato]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Costo Acquisto */}
        <div className="space-y-2">
          <Label htmlFor="costoAcquisto">Costo Acquisto (€) *</Label>
          <Input
            id="costoAcquisto"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("costoAcquisto", { valueAsNumber: true })}
          />
          {errors.costoAcquisto && (
            <p className="text-xs text-destructive">{errors.costoAcquisto.message}</p>
          )}
        </div>

        {/* Prezzo di Vendita */}
        <div className="space-y-2">
          <Label htmlFor="prezzoVendita">Prezzo venduto (€)</Label>
          <Input
            id="prezzoVendita"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("prezzoVendita", { 
              setValueAs: (v) => (v === "" || v === null ? null : parseFloat(v)) 
            })}
          />
        </div>

        {/* Data Inserimento Nascosta */}
        <input type="hidden" {...register("dataInserimento")} />

        {/* Data Vendita */}
        <div className="space-y-2">
          <Label htmlFor="dataVendita">Data Vendita</Label>
          <Input id="dataVendita" type="date" {...register("dataVendita")} />
        </div>

        {/* Ricavo Effettivo (Solo se venduto/spedito/completato) */}
        {(currentStato === "venduto" || currentStato === "spedito" || currentStato === "completato") && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ricavoEffettivo" className="text-emerald-600 font-semibold">Ricavo Effettivo su Vinted (€)</Label>
            <Input
              id="ricavoEffettivo"
              type="number"
              step="0.01"
              placeholder="0.00 (Entrate nette)"
              className="border-emerald-200 focus-visible:ring-emerald-500"
              {...register("ricavoEffettivo", { 
                setValueAs: (v) => (v === "" || v === null ? null : parseFloat(v)) 
              })}
            />
          </div>
        )}

        {/* Note */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="note">Note</Label>
          <Textarea id="note" placeholder="Note aggiuntive su spedizione, difetti, acquirente..." {...register("note")} rows={2} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel}>
            Annulla
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {mode === "create" ? "Aggiungi Capo" : "Salva Modifiche"}
        </Button>
      </div>
    </form>
  );
}
