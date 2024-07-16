import { Directive, ElementRef, Renderer2, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[ButtonResize]'
})
export class ButtonResizeDirective implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.checkWidth();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkWidth();
  }

  private checkWidth() {
    const width = window.innerWidth;
    const button = this.el.nativeElement;

    if (width <= 480) {
      this.renderer.addClass(button, 'button-icon');
      this.renderer.removeClass(button, 'button-icon-text');
      const buttonLabel = button.querySelector('.button-label');
      if (buttonLabel) {
        this.renderer.setStyle(buttonLabel, 'display', 'none');
      }
    } else {
      this.renderer.removeClass(button, 'button-icon');
      this.renderer.addClass(button, 'button-icon-text');
      const buttonLabel = button.querySelector('.button-label');
      if (buttonLabel) {
        this.renderer.setStyle(buttonLabel, 'display', 'inline-flex');
      }
    }
  }
}


