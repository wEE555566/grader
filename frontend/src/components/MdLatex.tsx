'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MdLatexProps {
  text: string;
  inline?: boolean;
}
const preprocessLatex = (str: string) => {
  if (!str) return '';
  // 1. Convert block and inline LaTeX delimiters that might incorrectly escape into JSON
  let res = str.replace(/\\\\\(([\\s\\S]*?)\\\\\)/g, (_, p1) => `$${p1}$`);
  res = res.replace(/\\\\\[([\\s\\S]*?)\\\\\]/g, (_, p1) => `$$${p1}$$`);

  // 2. Fix naked common latex commands inside () like (\vec{s}) -> ($\vec{s}$)
  // Removed because it aggressively matched parentheses inside valid $...$ blocks.

  // 3. Remove trailing isolated backslashes at end of lines 
  // (e.g. "ไปทางตะวันออก\") which breaks markdown sometimes
  res = res.replace(/\\$/gm, '');

  // 4. Convert literal '\n' string to actual newlines (happens due to double escaping in AI JSON)
  // We use negative lookahead (?![a-zA-Z]) to prevent it from matching valid LaTeX commands like \nu or \nabla
  res = res.replace(/\\n(?![a-zA-Z])/g, '\n');

  return res;
};

export default function MdLatex({ text, inline = false }: MdLatexProps) {
  if (!text) return null;

  return (
    <span className={inline ? 'md-latex-inline' : 'md-latex-block'}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={inline ? {
          p: ({ children }) => <>{children}</>,
        } : undefined}
      >
        {preprocessLatex(text)}
      </ReactMarkdown>
    </span>

  );
}
