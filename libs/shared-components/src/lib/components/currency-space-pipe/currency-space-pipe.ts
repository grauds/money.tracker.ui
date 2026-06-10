import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'currencySpace',
  standalone: true
})
export class CurrencySpacePipe implements PipeTransform {
  private currencyPipe = inject(CurrencyPipe);

  transform(value: any,
            currencyCode = 'RUB',
            display = 'code',
            digitsInfo = '1.2-2',
            locale = 'en-US'
  ): string | null {

    const formatted = this.currencyPipe.transform(
      value, currencyCode, display, digitsInfo, locale
    );

    if (!formatted) {
      return null;
    }

    // Check if the output starts with an ISO alphabet code (like RUB or USD)
    const hasAlphaCode = /^([+-]?)([A-Za-z]{3})/.test(formatted);

    if (hasAlphaCode) {
      // INJECT A SPACE: "RUB285.00" -> "RUB 285.00"
      return formatted.replace(
        /^([+-]?)([A-Za-z]{3})/, '$1$2\u00A0'
      );
    }

    // For graphical symbols (like $ or ₽), remove any accidental spaces
    // KEEP SNUG: "₽ 285.00" -> "₽285.00"
    return formatted.replace(
      /^([+-]?)([^0-9,.–-]+)\s+/, '$1$2'
    );
  }
}


