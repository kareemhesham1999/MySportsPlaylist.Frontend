import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchItemComponent } from './match-item.component';

describe('MatchItemComponent', () => {
  let component: MatchItemComponent;
  let fixture: ComponentFixture<MatchItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
