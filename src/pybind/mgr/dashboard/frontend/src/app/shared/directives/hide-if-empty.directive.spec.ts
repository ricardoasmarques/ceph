import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { HideIfEmptyDirective } from './hide-if-empty.directive';

@Component({
  template: `
    <div cdHideIfEmpty="ul">
      <ul>
        <li *ngIf="hasLi">
          Test
        </li>
      </ul>
    </div>
  `
})
class TestHideIfEmptyComponent {
  public hasLi: boolean;
}

describe('HideIfEmptyDirective', () => {

  let component: TestHideIfEmptyComponent;
  let fixture: ComponentFixture<TestHideIfEmptyComponent>;
  let inputEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestHideIfEmptyComponent, HideIfEmptyDirective]
    });
    fixture = TestBed.createComponent(TestHideIfEmptyComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('div'));
  });

  it('should show element', () => {
    component.hasLi = true;
    fixture.detectChanges();
    setTimeout(() => {
      expect(inputEl.nativeElement.className).toBe('');
    }, 0);
  });

  it('should hide element', () => {
    component.hasLi = false;
    fixture.detectChanges();
    setTimeout(() => {
      expect(inputEl.nativeElement.className).toBe('hidden');
    }, 0);
  });

});
