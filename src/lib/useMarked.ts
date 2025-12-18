import { marked } from 'marked';
import markedAlert from 'marked-alert';
import imageTlCorner from './assets/image_tl_corner.png';
import imageBrCorner from './assets/image_br_corner.png';

export const useMarked = () => {
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const parse = (markdown: string): Promise<string> | string => {
    marked.use(markedAlert());

    const renderer = new marked.Renderer();

    renderer.heading = ({ tokens, depth }) => {
      // tokens is an array of inline tokens; join their raw text
      const safeText = tokens
        .map((t) => t.raw || '')
        .join('')
        .replace(/\*\*|\*/g, '')
        .trim();
      const id = slugify(safeText);
      return `<h${depth} id="${id}">${safeText}</h${depth}>`;
    };

    // we want to replace bullet points with a custom icon
    // renderer.listitem = (token) => {
    //   // Render the tokens as HTML
    //   const html = Array.isArray(token.tokens) ? marked.parser(token.tokens) : String(token.text || '');
    //   return `<li class="list-none flex items-start mb-2">
    //         <span class="inline-block w-3 h-3 mt-[0.6rem] mr-2 bg-tprimary-500 rounded-xs flex-shrink-0"></span>
    //         <span class="flex-grow">${html}</span>
    //       </li>`;
    // };
    let depth = 0;

    renderer.list = function (token) {
      depth++;
      const tag = token.ordered ? 'ol' : 'ul';
      const items = token.items.map((item) => renderer.listitem(item)).join('');
      const html = `<${tag} class="">${items}</${tag}>`;
      depth--;
      return html;
    };

    renderer.listitem = function (token) {
      const html = Array.isArray(token.tokens) ? marked.parser(token.tokens, { renderer }) : String(token.text || '');
      let dot;
      if (depth === 1) {
        dot = `<span class="inline-block w-3 h-3 mt-[0.6rem] mr-2 bg-tprimary-500 rounded-xs flex-shrink-0"></span>`;
      } else {
        dot = `<span class="inline-block w-3 h-3 mt-[0.5rem] mr-2 flex-shrink-0" style="background: none;">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <polygon points="8,2 14,8 8,14 2,8" fill="#A855F7"/>
          </svg>
        </span>`;
      }
      return `<li class="list-none flex items-start mb-2">${dot}<span class="flex-grow">${html}</span></li>`;
    };

    renderer.html = (token) => {
      let text = token.text;

      if (token.text.includes('<img')) {
        // pull out the classes
        const classMatch = token.text.match(/class="([^"]*)"/);

        // remove the class from the original img tag
        let textWithoutClass = token.text.replace(/class="[^"]*"/, '');
        return `
          <div class="marked-image ${classMatch ? classMatch[1] : ''}">
            <img src="media/image_tl_corner.png" alt="" class="tl-corner" />
            ${textWithoutClass}
            <img src="media/image_br_corner.png" alt="" class="br-corner" />
          </div>
        `;
      }

      return text;
    };

    const html = marked(markdown, { renderer });

    return html;
  };

  return { parse, slugify };
};
