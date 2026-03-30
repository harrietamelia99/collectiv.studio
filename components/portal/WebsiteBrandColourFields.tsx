"use client";

import { useId, useState } from "react";
import { normalizeWebsiteHexInput } from "@/lib/website-brand-hex";

const inputClass =
  "min-w-0 flex-1 rounded-cc-card border border-burgundy/15 bg-cream px-4 py-3 font-body text-sm text-burgundy outline-none ring-burgundy/20 focus:ring-2 disabled:opacity-50";

function parseCssHex(raw: string): string | null {
  return normalizeWebsiteHexInput(raw);
}

function HexSwatch({ hex }: { hex: string | null }) {
  return (
    <span
      className="h-10 w-10 shrink-0 rounded-full border border-burgundy/25 bg-cream shadow-[inset_0_1px_2px_rgba(37,13,24,0.08)]"
      style={hex ? { backgroundColor: hex } : undefined}
      title={hex ?? undefined}
      aria-hidden
    />
  );
}

type RowProps = {
  id: string;
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
};

function ColourRow({ id, label, name, placeholder, value, onChange, disabled }: RowProps) {
  const preview = parseCssHex(value);
  return (
    <div className="flex flex-col gap-1.5 sm:col-span-1">
      <label htmlFor={id} className="font-body text-[10px] uppercase tracking-[0.12em] text-burgundy/55">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <HexSwatch hex={preview} />
        <input
          id={id}
          name={name}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputClass}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

export type WebsiteBrandColourFieldsProps = {
  initialPrimary: string;
  initialSecondary: string;
  initialAccent: string;
  initialQuaternary: string;
  clientCanEdit: boolean;
};

export function WebsiteBrandColourFields({
  initialPrimary,
  initialSecondary,
  initialAccent,
  initialQuaternary,
  clientCanEdit,
}: WebsiteBrandColourFieldsProps) {
  const baseId = useId();
  const [primary, setPrimary] = useState(initialPrimary);
  const [secondary, setSecondary] = useState(initialSecondary);
  const [accent, setAccent] = useState(initialAccent);
  const [quaternary, setQuaternary] = useState(initialQuaternary);

  return (
    <>
      <ColourRow
        id={`${baseId}-primary`}
        label="Primary"
        name="primaryHex"
        placeholder="250d18"
        value={primary}
        onChange={setPrimary}
        disabled={!clientCanEdit}
      />
      <ColourRow
        id={`${baseId}-secondary`}
        label="Secondary"
        name="secondaryHex"
        placeholder="f2edeb"
        value={secondary}
        onChange={setSecondary}
        disabled={!clientCanEdit}
      />
      <ColourRow
        id={`${baseId}-accent`}
        label="Accent"
        name="accentHex"
        placeholder="545454"
        value={accent}
        onChange={setAccent}
        disabled={!clientCanEdit}
      />
      <ColourRow
        id={`${baseId}-quaternary`}
        label="Additional"
        name="quaternaryHex"
        placeholder="c9a87c"
        value={quaternary}
        onChange={setQuaternary}
        disabled={!clientCanEdit}
      />
    </>
  );
}
