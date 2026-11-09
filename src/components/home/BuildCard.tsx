import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Zap } from "lucide-react";
import CategoryIsometricIcon from "@/components/CategoryIsometricIcon";
import { getBuildChips, getHeroPieces } from "@/lib/home/exampleBuilds";
import { ResolvedBuild } from "@/lib/home/pricedBuilds";

const money = (value: number) => `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function BuildCard({ build, index }: { build: ResolvedBuild; index: number }) {
  const pieces = getHeroPieces(build.parts);
  const chips = getBuildChips(build.parts);
  const { errors, warnings, estimatedPower } = build.compatibility;
  const verified = !build.missing.length;
  const status = !verified ? { tone: "warn", text: "Ficha por confirmar" }
    : errors.length ? { tone: "bad", text: `${errors.length} incompatibilidad${errors.length === 1 ? "" : "es"}` }
      : warnings.length ? { tone: "warn", text: `Compatible · ${warnings.length} por confirmar` }
        : { tone: "ok", text: "Compatible · revisado" };

  return (
    <article className="build-card">
      <div className="build-card-head">
        <span className="build-card-index">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="font-display text-3xl uppercase leading-none">{build.title}</h3>
        <p>{build.tagline}</p>
      </div>
      <ul className="build-card-parts" aria-label={`Piezas de la configuración ${build.title}`}>
        {pieces.map((piece) => {
          const part = build.parts[piece.key];
          return (
            <li key={piece.key}>
              <CategoryIsometricIcon slug={piece.key} name={piece.short} size={28} />
              <span className="min-w-0 flex-1">
                <small>{piece.short}</small>
                <strong>{piece.name}</strong>
              </span>
              <em className="build-card-part-price">{part && part.precio > 0 ? money(part.precio) : "—"}</em>
            </li>
          );
        })}
      </ul>
      <div className="build-card-footer">
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => <span key={chip} className="chip-tech">{chip}</span>)}
          {verified && estimatedPower ? <span className="chip-tech chip-tech-warm"><Zap size={11} />~{estimatedPower} W</span> : null}
        </div>
        <p className={`build-card-status build-card-status-${status.tone}`}>{status.tone === "ok" ? <Check size={13} /> : <AlertTriangle size={13} />}{status.text}</p>
        <div className="build-card-total">
          <span>{build.pending ? `Total · ${build.pending} por confirmar` : "Total del armado"}</span>
          <strong>{build.total > 0 ? money(build.total) : "Por confirmar"}</strong>
        </div>
        <Link href={build.href} className="btn-primary focus-ring mt-4 w-full" aria-label={`Cargar la configuración ${build.title} en el armador`}>
          Cargar en el armador <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
