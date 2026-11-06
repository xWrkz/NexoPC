import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import CategoryIsometricIcon from "@/components/CategoryIsometricIcon";
import { validarCompatibilidad } from "@/lib/compatibility/rules";
import { ExampleBuild, getBuildChips, getHeroPieces } from "@/lib/home/exampleBuilds";

export default function BuildCard({ build, index }: { build: ExampleBuild; index: number }) {
  const pieces = getHeroPieces(build.parts);
  const chips = getBuildChips(build.parts);
  const { estimatedPower } = validarCompatibilidad(build.parts);

  return (
    <article className="build-card group">
      <div className="build-card-head">
        <span className="build-card-index">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="font-display text-xl font-bold">{build.title}</h3>
        <p>{build.tagline}</p>
      </div>
      <ul className="build-card-parts" aria-label={`Piezas de la configuración ${build.title}`}>
        {pieces.map((piece) => (
          <li key={piece.key}>
            <CategoryIsometricIcon slug={piece.key} name={piece.short} size={28} />
            <span className="min-w-0">
              <small>{piece.short}</small>
              <strong>{piece.name}</strong>
            </span>
          </li>
        ))}
      </ul>
      <div className="build-card-footer">
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => <span key={chip} className="chip-tech">{chip}</span>)}
          {estimatedPower ? <span className="chip-tech chip-tech-warm"><Zap size={11} />~{estimatedPower} W</span> : null}
        </div>
        <Link href={`/arma-tu-pc?modo=guiado&uso=${build.id}`} className="btn-secondary focus-ring mt-5 w-full" aria-label={`Armar configuración de ${build.title.toLowerCase()}`}>
          Armar esta configuración <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
