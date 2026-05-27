module.exports = {
  process(source) {
    const code = source
      .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
      .replace(/\bexport\s+(async\s+)?function\s+(\w+)/g, 'module.exports.$2 = $1function')
      .replace(/\bexport\s+\{\s*(\w+)\s+as\s+default\s*\};?/g, 'module.exports.default = module.exports.$1;')
      .replace(/\bexport\s+\{([^}]+)\}/g, (_, names) =>
        names
          .split(',')
          .map(part => part.trim())
          .filter(Boolean)
          .map(part => {
            const [local, exported] = part.split(/\s+as\s+/).map(s => s.trim());
            const key = exported || local;
            return `module.exports.${key} = ${local};`;
          })
          .join('\n')
      );
    return { code };
  },
};
