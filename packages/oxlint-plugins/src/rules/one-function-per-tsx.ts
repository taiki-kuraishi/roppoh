import type { Rule } from "../lib/types.ts";

interface AstNode {
  type: string;
  range: [number, number];
}

interface WrappedExpression extends AstNode {
  expression: AstNode;
}

interface DeclaratorLike extends AstNode {
  init?: AstNode | null;
}

interface DeclarationLike extends AstNode {
  declarations?: readonly DeclaratorLike[];
}

interface StatementLike extends DeclarationLike {
  declaration?: DeclarationLike | null;
}

const WRAPPER_TYPES = new Set([
  "ParenthesizedExpression",
  "TSAsExpression",
  "TSSatisfiesExpression",
]);

const FUNCTION_EXPRESSION_TYPES = new Set(["ArrowFunctionExpression", "FunctionExpression"]);

const isWrapper = (node: AstNode): node is WrappedExpression => WRAPPER_TYPES.has(node.type);

const unwrapExpression = (node: AstNode): AstNode => {
  let current = node;
  while (isWrapper(current)) {
    current = current.expression;
  }
  return current;
};

const isFunctionExpression = (node: AstNode | null | undefined): boolean =>
  node !== null && node !== undefined && FUNCTION_EXPRESSION_TYPES.has(unwrapExpression(node).type);

/** Export 文をアンラップして検査対象の宣言を取り出す */
const resolveDeclaration = (statement: StatementLike): DeclarationLike | null => {
  if (
    statement.type === "ExportNamedDeclaration" ||
    statement.type === "ExportDefaultDeclaration"
  ) {
    return statement.declaration ?? null;
  }
  return statement;
};

/**
 * 宣言からトップレベルの関数定義ノードを収集する。
 * 呼び出し式の引数内の関数(`lazy(...)` など)や TSDeclareFunction は対象外。
 */
const collectFunctionNodes = (declaration: DeclarationLike, out: AstNode[]): void => {
  if (declaration.type === "FunctionDeclaration" || isFunctionExpression(declaration)) {
    out.push(declaration);
    return;
  }
  if (declaration.type === "VariableDeclaration" && declaration.declarations !== undefined) {
    for (const declarator of declaration.declarations) {
      if (isFunctionExpression(declarator.init)) {
        out.push(declarator);
      }
    }
  }
};

/**
 * .tsx ファイル 1 関数ルール
 *
 * 内容: .tsx ファイルのトップレベルに 2 つ以上の関数定義(関数宣言 /
 * 関数式で初期化された変数)がある場合に検知する。トップレベルの定数は対象外。
 *
 * 目的: 1 ファイル 1 コンポーネントを強制し、コンポーネントの責務が
 * 肥大化・混在するのを防ぐ。
 */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Limit .tsx files to at most one top-level function declaration (constants are allowed)",
    },
    messages: {
      multipleFunctions:
        "Only one top-level function may be defined in a .tsx file. Move any additional functions to a separate file (constants are allowed).",
    },
  },
  create(context) {
    return {
      Program(program) {
        if (!context.physicalFilename.endsWith(".tsx")) {
          return;
        }
        const functionNodes: AstNode[] = [];
        for (const statement of program.body) {
          const declaration = resolveDeclaration(statement);
          if (declaration !== null) {
            collectFunctionNodes(declaration, functionNodes);
          }
        }
        for (const extra of functionNodes.slice(1)) {
          context.report({ node: extra, messageId: "multipleFunctions" });
        }
      },
    };
  },
} satisfies Rule;

export default rule;
