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

const rule = {
  meta: {
    type: "problem",
    docs: {
      description: ".tsx ファイルのトップレベル関数定義を1つまでに制限する(定数は許可)",
    },
    messages: {
      multipleFunctions:
        ".tsx ファイルに定義できるトップレベル関数は1つまでです。2つ目以降の関数は別ファイルへ移動してください(定数は許可)。",
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
