const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SRC_ROOT_PATTERN = /^(.*\/apps\/[^/]+\/src)(?:\/|$)/;

export const isKebabCase = (segment: string): boolean => KEBAB_CASE.test(segment);

/** `apps/<app>/src` までの絶対パスを返す。対象アプリ配下でなければ null */
export const findSrcRoot = (filename: string): string | null =>
  SRC_ROOT_PATTERN.exec(filename)?.[1] ?? null;

/** Vite の `?react` などのクエリサフィックスを取り除く */
export const stripQuery = (specifier: string): string => {
  const index = specifier.indexOf("?");
  return index === -1 ? specifier : specifier.slice(0, index);
};

/** Specifier の解決基準ディレクトリと残りのパスを返す。bare specifier は null */
const resolveBase = (
  importerPath: string,
  specifier: string,
): { base: string; rest: string } | null => {
  if (specifier.startsWith("@/")) {
    const srcRoot = findSrcRoot(importerPath);
    return srcRoot === null ? null : { base: srcRoot, rest: specifier.slice(2) };
  }
  if (specifier.startsWith(".")) {
    return { base: importerPath.slice(0, importerPath.lastIndexOf("/")), rest: specifier };
  }
  return null;
};

/** パスセグメントを 1 つ適用する。ルートを突き抜ける `..` は false を返す */
const applySegment = (segments: string[], segment: string): boolean => {
  if (segment === "..") {
    if (segments.length <= 1) {
      return false;
    }
    segments.pop();
    return true;
  }
  if (segment !== "" && segment !== ".") {
    segments.push(segment);
  }
  return true;
};

/**
 * 指定された import specifier を絶対パスへ解決する。
 * `@/` は importer の srcRoot 基準、`./` `../` は importer のディレクトリ基準。
 * bare specifier(npm パッケージ等)は対象外として null を返す。
 */
export const resolveImport = (importerPath: string, specifier: string): string | null => {
  const parts = resolveBase(importerPath, specifier);
  if (parts === null) {
    return null;
  }
  const segments = parts.base.split("/");
  for (const segment of parts.rest.split("/")) {
    if (!applySegment(segments, segment)) {
      return null;
    }
  }
  return segments.join("/");
};

/**
 * ファイルが属するコロケーション境界(`pages/<name>` / `layouts/<name>` ディレクトリ)の
 * 絶対パスを返す。境界ディレクトリの中にいなければ null。
 */
export const findFeatureBoundary = (filename: string): string | null => {
  const srcRoot = findSrcRoot(filename);
  if (srcRoot === null) {
    return null;
  }
  const segments = filename.slice(srcRoot.length + 1).split("/");
  for (let i = 0; i < segments.length - 2; i += 1) {
    if (segments[i] === "pages" || segments[i] === "layouts") {
      return `${srcRoot}/${segments.slice(0, i + 2).join("/")}`;
    }
  }
  return null;
};
