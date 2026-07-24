// Semantic validation for the proto-derived schema model. Catches what
// `buf breaking` / `buf lint` cannot: logical-type sanity and the two-knob
// (Pipelines-required vs pointer/NULL) consistency described in the plan.

export type Logical = "timestamp" | "string" | "long" | "boolean";

const LOGICALS = new Set<Logical>(["timestamp", "string", "long", "boolean"]);

export interface FieldModel {
  name: string;
  number: number;
  logical: Logical;
  // Proto3 `optional` => Go pointer, distinguishes NULL from the zero value.
  optional: boolean;
  // Explicit (pipelines_required) override, if the field set one.
  pipelinesRequiredOverride?: boolean;
  scalarIsString: boolean;
}

export interface MessageModel {
  goName: string;
  namespace: string;
  tables: { table: string; stream: string }[];
  fields: FieldModel[];
}

const IDENT_RE = /^[a-z][a-z0-9_]*$/;

function validateField(m: MessageModel, f: FieldModel): void {
  if (!LOGICALS.has(f.logical)) {
    throw new Error(`${m.goName}.${f.name}: invalid logical_type "${f.logical}"`);
  }
  if (f.logical === "timestamp" && !f.scalarIsString) {
    throw new Error(`${m.goName}.${f.name}: logical_type=timestamp requires a string field`);
  }
  // `optional` already forces Pipelines required=false; a redundant/conflicting
  // (pipelines_required) override would be misleading.
  if (f.optional && f.pipelinesRequiredOverride !== undefined) {
    throw new Error(
      `${m.goName}.${f.name}: drop (pipelines_required) on an optional field (already not required)`,
    );
  }
}

function validateTables(m: MessageModel): void {
  if (m.tables.length === 0) {
    throw new Error(`${m.goName}: missing (table) option`);
  }
  for (const { table, stream } of m.tables) {
    if (!IDENT_RE.test(table) || !IDENT_RE.test(stream)) {
      throw new Error(`${m.goName}: (table) "${table}:${stream}" must be lower_snake identifiers`);
    }
  }
}

function validateFields(m: MessageModel): void {
  const numbers = new Set<number>();
  for (const f of m.fields) {
    if (numbers.has(f.number)) {
      throw new Error(`${m.goName}.${f.name}: duplicate field number ${f.number}`);
    }
    numbers.add(f.number);
    validateField(m, f);
  }
}

function validateMessage(m: MessageModel): void {
  if (!m.namespace) {
    throw new Error(`${m.goName}: missing (namespace) option`);
  }
  validateTables(m);
  validateFields(m);
}

export function validateModel(messages: MessageModel[]): void {
  if (messages.length === 0) {
    throw new Error("no messages carry a (table) option; nothing to generate");
  }
  for (const m of messages) {
    validateMessage(m);
  }
}
