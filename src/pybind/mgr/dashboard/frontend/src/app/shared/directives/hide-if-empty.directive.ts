import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

/**
 * Adds 'hidden' class if the selected child is empty
 *
 * Example:
 * ```
 * <li cdHideIfEmpty="ul">
 *   ...
 * </li>
 * ```
 */
@Directive({
  selector: '[cdHideIfEmpty]'
})
export class HideIfEmptyDirective implements OnInit {

  /**
   * The child element selector
   */
  @Input() cdHideIfEmpty: string;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) { }

  ngOnInit() {
    setTimeout(() => {
      if (this.elementRef.nativeElement.querySelector(this.cdHideIfEmpty).childElementCount === 0) {
        this.renderer.addClass(this.elementRef.nativeElement, 'hidden');
      }
    }, 0);
  }
}
