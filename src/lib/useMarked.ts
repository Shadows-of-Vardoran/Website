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
    marked.use(
      markedAlert({
        variants: [
          {
            type: 'example',
            icon: '<svg class="octicon octicon-book mr-2" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.318.51 3.072 1.332A4.743 4.743 0 0 1 11.003 1h4.253a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-4.253a3.243 3.243 0 0 0-2.618 1.332.75.75 0 0 1-1.264 0A3.243 3.243 0 0 0 4.753 15H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324c.417-.508.976-1.017 1.76-1.324a.75.75 0 0 1 .49 0c.783.307 1.342.816 1.76 1.324a.75.75 0 0 1-1.188.912c-.212-.258-.482-.508-.813-.672a3.016 3.016 0 0 0-.808.672.75.75 0 1 1-1.188-.912ZM8 2.586A3.242 3.242 0 0 0 5.003 2H1.5v11h3.503c1.227 0 2.318.51 3.072 1.332a.75.75 0 0 0 .22.175V2.586ZM11.003 2a3.242 3.242 0 0 0-2.998.586v10.92a.75.75 0 0 0 .22-.175A4.743 4.743 0 0 1 11.003 12H14.5V2h-3.497Z"></path></svg>',
            title: 'Example',
          },
        ],
      })
    );

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
    let isOrdered = false;

    renderer.list = function (token) {
      depth++;
      isOrdered = token.ordered;
      const tag = token.ordered ? 'ol' : 'ul';
      const cls = token.ordered ? 'class="marked-ol"' : '';
      const items = token.items.map((item) => renderer.listitem(item)).join('');
      const html = `<${tag} ${cls}>${items}</${tag}>`;
      depth--;
      return html;
    };

    renderer.listitem = function (token) {
      const html = Array.isArray(token.tokens) ? marked.parser(token.tokens, { renderer }) : String(token.text || '');
      let dot;
      if (isOrdered) {
        dot = `<span class="inline-block w-4 mr-1 flex-shrink-0 font-bold text-tprimary-50 marked-ol-num"></span>`;
      } else if (depth === 1) {
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
