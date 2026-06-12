import type { RuleTester } from "oxlint/plugins-dev";

// `oxlint/plugins-dev` は RuleTester しか export していないため、Rule / Context 型をそこから導出する
export type Rule = Parameters<RuleTester["run"]>[1];
export type Context = Parameters<NonNullable<Rule["create"]>>[0];
