import { load } from 'cheerio';
export function loadHtml(html) {
    return load(html);
}
