import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import XRegExp from 'xregexp';

/*
 * Changes color of specific string in text.
 *
 * Used to highlight searched term in namespace autocomplete.
 * Highlights search terms when:
 * - are short prefixes
 * - are after last slash in uri
 * - are after hash sign
 * - are short namespaces
 */
@Pipe({
  name: 'highlightNamespace',
})
export class HighlightNamespacePipe implements PipeTransform {
  // Matches
  // - everything after latest hash or latest slash or latest semicolon
  // - everything before semicolon if is last character
  regex = XRegExp(`(?<value> (?:.(?!\\#|\\/|:.))+$)-?`, 'x');

  constructor(private sanitized: DomSanitizer) {}

  transform(text: any, search: string): string {
    const toHighlight = XRegExp.exec(text, this.regex);

    const semicolonPosition = search.indexOf(':');
    let searchFor = search;
    // check if the search term contains semicolon
    // if so, the highlighted search term is after the semicolon
    // example: rdf:<search term>
    if (semicolonPosition > -1) {
      searchFor = search.substring(semicolonPosition + 1);
    }

    const highlighted = toHighlight.value.replace(XRegExp(searchFor, 'gi'), (match) => `<span style="color: #ed4f2f;">${match}</span>`);
    const highlightedText = toHighlight.index === 0 ? highlighted : text.substring(0, toHighlight.index) + highlighted;

    // TODO: there is a security issue with 'bypassSecurityTrustHtml' which cannot be fixed ATM.
    // At some point we need to find solution for it.
    return search ? this.sanitized.bypassSecurityTrustHtml(highlightedText) : text;
  }
}
